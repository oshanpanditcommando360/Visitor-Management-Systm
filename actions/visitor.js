"use server";
import { db } from "@/lib/prisma";
import { createAlert } from "./alert";

export const visitRequestByGuard = async (visitData) => {
  try {
    const visitor = await db.visitor.create({
      data: {
        name:visitData.name,
        purpose:visitData.purpose,
        clientId:visitData.clientId,
        requestedByGuard: true,
        status: "PENDING",
      },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "ENTRY",
      message: `${visitor.name} visit requested`,
    });
    return visitor;
  } catch (error) {
    console.error("Error creating visitor request:", error.message);
    throw new Error("Failed to submit visitor request.");
  }
};

export const getVisitorLogsForGuard = async () => {
  try {
    const visitors = await db.visitor.findMany({
      where: { requestedByGuard:true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return visitors;
  } catch (error) {
    console.error("Failed to fetch logs", error);
    throw new Error("Unable to fetch logs.");
  }
};

