"use server";
import { db } from "@/lib/prisma";

export const checkOverstayedVisitors = async () => {
  const now = new Date();
  const visitors = await db.visitor.findMany({
    where: {
      scheduledExit: { lt: now },
      status: "CHECKED_IN",
    },
    select: { id: true, name: true },
  });

  for (const v of visitors) {
    const existing = await db.alert.findFirst({
      where: { visitorId: v.id, type: "TIMEOUT" },
    });
    if (!existing) {
      await db.visitor.update({
        where: { id: v.id },
        data: { status: "OVERSTAYED" },
      });
      await db.alert.create({
        data: {
          visitorId: v.id,
          type: "TIMEOUT",
          message: `${v.name} has overstayed`,
        },
      });
    }
  }
};

export const createAlert = async ({ visitorId, type, message }) => {
  try {
    const alert = await db.alert.create({
      data: { visitorId, type, message },
    });
    return alert;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw new Error("Failed to create alert.");
  }
};

export const getClientAlerts = async (clientId) => {
  try {
    await checkOverstayedVisitors();
    const alerts = await db.alert.findMany({
      where: {
        visitor: { clientId },
      },
      orderBy: { triggeredAt: "desc" },
      include: { visitor: { select: { name: true } } },
      take: 20,
    });
    return alerts.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      triggeredAt: a.triggeredAt,
      visitorName: a.visitor.name,
    }));
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw new Error("Failed to fetch alerts.");
  }
};

export const deleteAlert = async (id) => {
  try {
    await db.alert.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting alert:", error);
    throw new Error("Failed to delete alert.");
  }
};
