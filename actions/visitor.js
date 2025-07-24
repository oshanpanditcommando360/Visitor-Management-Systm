"use server";
import { db } from "@/lib/prisma";
import { createAlert } from "./alert";

export const visitRequestByGuard = async (visitData) => {
  try {
    let clientId = visitData.clientId;
    if (!clientId) {
      const defaultClient = await db.client.findFirst();
      if (!defaultClient) {
        throw new Error("No client found");
      }
      clientId = defaultClient.id;
    }
    const endUser = await db.endUser.findFirst({
      where: { clientId, department: visitData.department },
    });
    const visitor = await db.visitor.create({
      data: {
        name: visitData.name,
        purpose: visitData.purpose,
        vehicleImage: visitData.vehicleImage ?? null,
        post: visitData.post ?? null,
        clientId,
        department: visitData.department,
        endUserName: endUser?.name ?? null,
        endUserId: endUser?.id ?? null,
        approvalType: endUser?.approvalType ?? "CLIENT_ONLY",
        requestedByGuard: true,
        status: "PENDING",
      },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "REQUESTED",
      message: `${visitor.name} visit requested from ${visitData.post}`,
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
        OR: [{ requestedByGuard: true }, { checkInTime: { not: null } }],
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
      where: {
        OR: [
          { requestedByGuard: false, status: "SCHEDULED" },
          { requestedByGuard: true, status: "APPROVED" },
        ],
      },
      orderBy: { scheduledEntry: "asc" },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("Failed to fetch scheduled visitors", error);
    throw new Error("Unable to fetch scheduled visitors.");
  }
};

export const validateVisitor = async ({
  visitorId,
  otp,
  vehicleImage,
  post,
}) => {
  if (otp !== "1234") throw new Error("Invalid OTP");
  try {
    const existing = await db.visitor.findUnique({
      where: { id: visitorId },
      select: { status: true },
    });
    if (!existing) throw new Error("Visitor not found");
    if (existing.status === "CHECKED_IN") {
      throw new Error("Visitor already checked in with the qr/otp");
    }
    const updateData = { status: "CHECKED_IN", checkInTime: new Date() };
    if (vehicleImage) updateData.vehicleImage = vehicleImage;
    if (post) updateData.post = post;
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: updateData,
    });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} validated at ${post}`,
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
      where: { status: { in: ["CHECKED_IN", "OVERSTAYED"] } },
      orderBy: { checkInTime: "desc" },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("Failed to fetch checked-in visitors", error);
    throw new Error("Unable to fetch checked-in visitors.");
  }
};

export const checkoutVisitor = async (visitorId, post) => {
  try {
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: { status: "CHECKED_OUT", checkOutTime: new Date() },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "EXIT",
      message: `${visitor.name} checked out from ${post}`,
    });
    return visitor;
  } catch (error) {
    console.error("Failed to checkout visitor", error);
    throw new Error("Unable to checkout visitor.");
  }
};

export const checkInVisitorByQr = async (visitorId, vehicleImage, post) => {
  try {
    const existing = await db.visitor.findUnique({ where: { id: visitorId } });
    if (!existing) {
      throw new Error("Invalid QR code");
    }

    if (existing.status === "CHECKED_OUT") {
      throw new Error("This QR has expired.");
    }

    if (existing.status === "CHECKED_IN") {
      throw new Error("Visitor already checked in with the qr/otp");
    }

    const updateData = { status: "CHECKED_IN", checkInTime: new Date() };
    if (vehicleImage) updateData.vehicleImage = vehicleImage;
    if (post) updateData.post = post;
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: updateData,
    });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} validated by QR at ${post}`,
    });
    return visitor;
  } catch (error) {
    console.error("Failed to validate visitor via QR", error);
    throw new Error("Unable to validate visitor via QR.");
  }
};
