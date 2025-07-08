"use server";
import { db } from "@/lib/prisma";

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
