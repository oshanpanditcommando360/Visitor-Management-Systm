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
      type: "REQUESTED",
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
      where: {
        OR: [
          { requestedByGuard: true },
          { checkInTime: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return visitors;
  } catch (error) {
    console.error("Failed to fetch logs", error);
    throw new Error("Unable to fetch logs.");
  }
};

export const getScheduledVisitors = async () => {
  try {
    return await db.visitor.findMany({
      where: { requestedByGuard: false, status: "APPROVED" },
      orderBy: { scheduledEntry: "asc" },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("Failed to fetch scheduled visitors", error);
    throw new Error("Unable to fetch scheduled visitors.");
  }
};

export const validateVisitor = async ({ visitorId, otp }) => {
  if (otp !== "1234") throw new Error("Invalid OTP");
  try {
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: { status: "CHECKED_IN", checkInTime: new Date() },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} validated at gate`,
    });
    return visitor;
  } catch (error) {
    console.error("Failed to validate visitor", error);
    throw new Error("Unable to validate visitor.");
  }
};

export const getCheckedInVisitors = async () => {
  try {
    return await db.visitor.findMany({
      where: { status: "CHECKED_IN" },
      orderBy: { checkInTime: "desc" },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("Failed to fetch checked-in visitors", error);
    throw new Error("Unable to fetch checked-in visitors.");
  }
};

export const checkoutVisitor = async (visitorId) => {
  try {
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: { status: "CHECKED_OUT", checkOutTime: new Date() },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "EXIT",
      message: `${visitor.name} checked out`,
    });
    return visitor;
  } catch (error) {
    console.error("Failed to checkout visitor", error);
    throw new Error("Unable to checkout visitor.");
  }
};

export const checkInVisitorByQr = async (visitorId) => {
  try {
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: { status: "CHECKED_IN", checkInTime: new Date() },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} validated by QR`,
    });
    return visitor;
  } catch (error) {
    console.error("Failed to validate visitor via QR", error);
    throw new Error("Unable to validate visitor via QR.");
  }
};

