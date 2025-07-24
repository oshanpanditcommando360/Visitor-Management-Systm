"use server";
import { db } from "@/lib/prisma";
import { createAlert } from "./alert";

export const addContractorByClient = async ({
  name,
  phone,
  material,
  scheduledEntry,
  scheduledExit,
  clientId,
}) => {
  try {
    const contractor = await db.contractor.create({
      data: {
        name,
        phone,
        material,
        scheduledEntry: new Date(scheduledEntry),
        scheduledExit: new Date(scheduledExit),
        clientId,
        status: "SCHEDULED",
      },
    });
    return contractor;
  } catch (err) {
    console.error("Failed to add contractor:", err);
    throw new Error("Could not add contractor.");
  }
};

export const getAllContractorRecords = async (clientId) => {
  try {
    const contractors = await db.contractor.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
    return contractors.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      material: c.material ?? "None",
      vehicleImage: c.vehicleImage ?? null,
      materialImage: c.materialImage ?? null,
      post: c.post ?? "-",
      date: c.scheduledEntry ? c.scheduledEntry.toLocaleDateString() : "-",
      scheduledCheckIn: c.scheduledEntry
        ? c.scheduledEntry.toLocaleTimeString()
        : "-",
      scheduledCheckOut: c.scheduledExit
        ? c.scheduledExit.toLocaleTimeString()
        : "-",
      checkInTime: c.checkInTime ? c.checkInTime.toLocaleTimeString() : "-",
      checkOutTime: c.checkOutTime ? c.checkOutTime.toLocaleTimeString() : "-",
      status: c.status,
    }));
  } catch (err) {
    throw new Error("Failed to retrieve contractor records.");
  }
};

export const contractorRequestByGuard = async (data) => {
  try {
    let clientId = data.clientId;
    if (!clientId) {
      const client = await db.client.findFirst();
      if (!client) throw new Error("No client found");
      clientId = client.id;
    }
    const contractor = await db.contractor.create({
      data: {
        name: data.name,
        phone: data.phone,
        material: data.material,
        materialImage: data.materialImage ?? null,
        vehicleImage: data.vehicleImage ?? null,
        vehicleNumber: data.vehicleNumber ?? null,
        post: data.post ?? null,
        clientId,
        status: "PENDING",
      },
    });
    await createAlert({
      contractorId: contractor.id,
      type: "REQUESTED",
      message: `Contractor ${contractor.name} requested for visit with ${
        contractor.material ?? "no"
      } material from ${data.post}`,
    });
    return contractor;
  } catch (err) {
    console.error("Failed to request contractor:", err);
    throw new Error("Could not submit contractor request.");
  }
};

export const getContractorLogsForGuard = async () => {
  try {
    return await db.contractor.findMany({
      where: {
        OR: [{ status: "PENDING" }, { checkInTime: { not: null } }],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (err) {
    console.error("Failed to fetch contractor logs", err);
    throw new Error("Unable to fetch contractor logs.");
  }
};

export const getScheduledContractors = async () => {
  try {
    return await db.contractor.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { scheduledEntry: "asc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("Failed to fetch contractors", err);
    throw new Error("Unable to fetch contractors.");
  }
};

export const getCheckedInContractors = async () => {
  try {
    return await db.contractor.findMany({
      where: { status: "CHECKED_IN" },
      orderBy: { checkInTime: "desc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("Failed to fetch checked in contractors", err);
    throw new Error("Unable to fetch checked in contractors.");
  }
};

export const validateContractor = async ({
  contractorId,
  otp,
  vehicleImage,
  materialImage,
  post,
}) => {
  if (otp !== "1234") throw new Error("Invalid OTP");
  try {
    const existing = await db.contractor.findUnique({
      where: { id: contractorId },
      select: { status: true },
    });
    if (!existing) throw new Error("Contractor not found");
    if (existing.status === "CHECKED_IN") {
      throw new Error("Already checked in");
    }
    const contractor = await db.contractor.update({
      where: { id: contractorId },
      data: {
        status: "CHECKED_IN",
        checkInTime: new Date(),
        vehicleImage: vehicleImage ?? undefined,
        materialImage: materialImage ?? undefined,
        post: post ?? undefined,
      },
    });
    await createAlert({
      contractorId: contractor.id,
      type: "CHECKED_IN",
      message: `Contractor ${contractor.name} validated at ${post}`,
    });
    return contractor;
  } catch (err) {
    console.error("Failed to validate contractor", err);
    throw new Error("Unable to validate contractor.");
  }
};

export const checkoutContractor = async (contractorId, post) => {
  try {
    const contractor = await db.contractor.update({
      where: { id: contractorId },
      data: { status: "CHECKED_OUT", checkOutTime: new Date() },
    });
    await createAlert({
      contractorId: contractor.id,
      type: "EXIT",
      message: `Contractor ${contractor.name} checked out from ${post}`,
    });
    return contractor;
  } catch (err) {
    console.error("Failed to checkout contractor", err);
    throw new Error("Unable to checkout contractor.");
  }
};

export const checkInContractorByQr = async (
  contractorId,
  vehicleImage,
  materialImage,
  post
) => {
  try {
    const existing = await db.contractor.findUnique({ where: { id: contractorId } });
    if (!existing) throw new Error("Invalid QR code");
    if (existing.status === "CHECKED_OUT") throw new Error("This QR has expired.");
    if (existing.status === "CHECKED_IN") throw new Error("Already checked in");
    const contractor = await db.contractor.update({
      where: { id: contractorId },
      data: {
        status: "CHECKED_IN",
        checkInTime: new Date(),
        vehicleImage: vehicleImage ?? undefined,
        materialImage: materialImage ?? undefined,
        post: post ?? undefined,
      },
    });
    await createAlert({
      contractorId: contractor.id,
      type: "CHECKED_IN",
      message: `Contractor ${contractor.name} validated by QR at ${post}`,
    });
    return contractor;
  } catch (err) {
    console.error("Failed to validate contractor via QR", err);
    throw new Error("Unable to validate contractor via QR.");
  }
};
