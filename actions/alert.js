"use server";
import { db } from "@/lib/prisma";

export const checkOverstayedVisitors = async () => {
  const now = new Date();
  const visitors = await db.visitor.findMany({
    where: { scheduledExit: { lt: now }, status: "CHECKED_IN" },
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
        data: { visitorId: v.id, type: "TIMEOUT", message: `${v.name} has overstayed` },
      });
    }
  }
  const contractors = await db.contractor.findMany({
    where: { scheduledExit: { lt: now }, status: "CHECKED_IN" },
    select: { id: true, name: true },
  });
  for (const c of contractors) {
    const existing = await db.alert.findFirst({
      where: { contractorId: c.id, type: "TIMEOUT" },
    });
    if (!existing) {
      await db.contractor.update({
        where: { id: c.id },
        data: { status: "OVERSTAYED" },
      });
      await db.alert.create({
        data: { contractorId: c.id, type: "TIMEOUT", message: `${c.name} has overstayed` },
      });
    }
  }
};

export const createAlert = async ({ visitorId, contractorId, type, message }) => {
  try {
    const alert = await db.alert.create({
      data: { visitorId, contractorId, type, message },
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
        OR: [
          { visitor: { clientId } },
          { contractor: { clientId } },
        ],
      },
      orderBy: { triggeredAt: "desc" },
      include: {
        visitor: { select: { name: true } },
        contractor: { select: { name: true } },
      },
      take: 20,
    });
    return alerts.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      triggeredAt: a.triggeredAt,
      visitorName: a.visitor?.name ?? a.contractor?.name,
      for: a.visitorId ? "VISITOR" : "CONTRACTOR",
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
