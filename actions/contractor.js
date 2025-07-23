"use server";
import { db } from "@/lib/prisma";
import { createAlert } from "./alert";

export const contractorRequestByGuard = async (data) => {
  try {
    let clientId = data.clientId;
    if (!clientId) {
      const defaultClient = await db.client.findFirst();
      if (!defaultClient) throw new Error("No client found");
      clientId = defaultClient.id;
    }
    const contractor = await db.visitor.create({
      data: {
        name: data.name,
        materialType: data.materialType,
        materialImage: data.materialImage ?? null,
        vehicleImage: data.vehicleImage ?? null,
        clientId,
        department: "ADMIN",
        requestedByGuard: true,
        isContractor: true,
        status: "PENDING",
      },
    });
    await createAlert({
      visitorId: contractor.id,
      type: "REQUESTED",
      message: `${contractor.name} contractor request`,
    });
    return contractor;
  } catch (err) {
    console.error("Error contractor request:", err);
    throw new Error("Failed to submit contractor request.");
  }
};

export const getContractorLogsForGuard = async () => {
  try {
    return await db.visitor.findMany({
      where: {
        isContractor: true,
        OR: [
          { requestedByGuard: true },
          { checkInTime: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (err) {
    console.error("Failed to fetch contractor logs", err);
    throw new Error("Unable to fetch logs.");
  }
};

export const getScheduledContractors = async () => {
  try {
    return await db.visitor.findMany({
      where: {
        isContractor: true,
        OR: [
          { requestedByGuard: false, status: "SCHEDULED" },
          { requestedByGuard: true, status: "APPROVED" },
        ],
      },
      orderBy: { scheduledEntry: "asc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("Failed to fetch scheduled contractors", err);
    throw new Error("Unable to fetch scheduled contractors.");
  }
};

export const validateContractor = async ({ contractorId, otp, vehicleImage }) => {
  if (otp !== "1234") throw new Error("Invalid OTP");
  try {
    const existing = await db.visitor.findUnique({ where: { id: contractorId }, select: { status: true } });
    if (!existing) throw new Error("Contractor not found");
    if (existing.status === "CHECKED_IN") {
      throw new Error("Contractor already checked in with the qr/otp");
    }
    const updateData = { status: "CHECKED_IN", checkInTime: new Date() };
    if (vehicleImage) updateData.vehicleImage = vehicleImage;
    const visitor = await db.visitor.update({
      where: { id: contractorId },
      data: updateData,
    });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} contractor validated`,
    });
    return visitor;
  } catch (err) {
    console.error("Failed to validate contractor", err);
    throw new Error("Unable to validate contractor.");
  }
};

export const getCheckedInContractors = async () => {
  try {
    return await db.visitor.findMany({
      where: { isContractor: true, status: "CHECKED_IN" },
      orderBy: { checkInTime: "desc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("Failed to fetch checked-in contractors", err);
    throw new Error("Unable to fetch checked-in contractors.");
  }
};

export const checkoutContractor = async (contractorId) => {
  try {
    const visitor = await db.visitor.update({
      where: { id: contractorId },
      data: { status: "CHECKED_OUT", checkOutTime: new Date() },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "EXIT",
      message: `${visitor.name} contractor checked out`,
    });
    return visitor;
  } catch (err) {
    console.error("Failed to checkout contractor", err);
    throw new Error("Unable to checkout contractor.");
  }
};

export const checkInContractorByQr = async (contractorId, vehicleImage) => {
  try {
    const existing = await db.visitor.findUnique({ where: { id: contractorId } });
    if (!existing) throw new Error("Invalid QR code");
    if (existing.status === "CHECKED_OUT") throw new Error("This QR has expired.");
    if (existing.status === "CHECKED_IN") throw new Error("Contractor already checked in with the qr/otp");
    const updateData = { status: "CHECKED_IN", checkInTime: new Date() };
    if (vehicleImage) updateData.vehicleImage = vehicleImage;
    const visitor = await db.visitor.update({ where: { id: contractorId }, data: updateData });
    await createAlert({
      visitorId: visitor.id,
      type: "CHECKED_IN",
      message: `${visitor.name} contractor validated by QR`,
    });
    return visitor;
  } catch (err) {
    console.error("Failed to validate contractor via QR", err);
    throw new Error("Unable to validate contractor via QR.");
  }
};
