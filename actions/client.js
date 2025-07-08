"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAlert } from "./alert";

export const createClient = async (clientData) => {
    try {
        const hashedPassword = await bcrypt.hash(clientData.password, 10);

        const client = await db.client.create({
            data: {
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                password: hashedPassword,
            },
        });

        return client;
    } catch (error) {
        console.error("An error occurred while creating client:", error.message);
        throw new Error("Failed to create client");
    }
};

export const signInClient = async ({ email, password }) => {
    try {
        const client = await db.client.findUnique({ where: { email } });

        if (!client) {
            throw new Error("No account found with this email.");
        }

        const isValid = await bcrypt.compare(password, client.password);
        if (!isValid) {
            throw new Error("Incorrect email/password.");
        }
        return client;
    } catch (err) {
        console.error("Sign-in error:", err.message);
        throw new Error(err.message || "Something went wrong during sign-in.");
    }
}

export const getPendingVisitorRequests = async (clientId) => {
  try {
    const visitors = await db.visitor.findMany({
      where: {
        status: "PENDING",
        requestedByGuard: true,
        clientId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return visitors;
  } catch (error) {
    console.error("Error fetching pending visitors:", error);
    throw new Error("Could not fetch pending visitor requests.");
  }
};

export const approveVisitorRequest = async ({ visitorId, durationHours, durationMinutes }) => {
  try {
    const now = new Date();
    const scheduledExit = new Date(now.getTime() + durationHours * 60 * 60 * 1000 + durationMinutes * 60 * 1000);

    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: {
        status: "CHECKED_IN",
        scheduledEntry: now,
        scheduledExit: scheduledExit,
        checkInTime: now,
        approvedByClient: true,
      },
    });

    await createAlert({
      visitorId: visitor.id,
      type: "ENTRY",
      message: `${visitor.name} checked in`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error approving visitor:", error);
    throw new Error("Could not approve visitor request.");
  }
};

export const denyVisitorRequest = async (visitorId) => {
  try {
    await db.visitor.update({
      where: {
        id: visitorId,
      },
      data: {
        status: "DENIED", 
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error denying visitor:", error);
    throw new Error("Could not deny visitor request.");
  }
};

export const addVisitorByClient = async ({
  name,
  phone,
  purpose,
  scheduledEntry,
  scheduledExit,
  clientId,
}) => {
  try {
    const visitor = await db.visitor.create({
      data: {
        name,
        purpose,
        scheduledEntry: new Date(scheduledEntry),
        scheduledExit: new Date(scheduledExit),
        clientId,
        phone,
        requestedByGuard: false,
        status: "APPROVED",
      },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "ENTRY",
      message: `${visitor.name} visit scheduled`,
    });

    return visitor;
  } catch (err) {
    console.error("Failed to add visitor:", err);
    throw new Error("Could not add visitor.");
  }
};

export const getAllVisitorRecords = async (clientId) => {
  try {
    const visitors = await db.visitor.findMany({
      where: { clientId },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        purpose: true,
        scheduledEntry: true,
        scheduledExit: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        createdAt: true,
      },
    });

    return visitors.map((visitor) => ({
      id: visitor.id,
      name: visitor.name,
      purpose: visitor.purpose,
      date: visitor.scheduledEntry?.toLocaleDateString() ?? "-",
      checkInTime: visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleTimeString() : "-",
      scheduledCheckOut: visitor.scheduledExit ? new Date(visitor.scheduledExit).toLocaleTimeString() : "-",
      actualCheckOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleTimeString() : "-",
      status:
        visitor.status === "PENDING" && !visitor.scheduledEntry
          ? "Not Checked In"
          : visitor.status,
    }));
  } catch (err) {
    throw new Error("Failed to retrieve visitor records.");
  }
};






