"use server";
import { db } from "@/lib/prisma";

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
