"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAlert } from "./alert";
import { setSession } from "@/lib/session";
import aj from "@/lib/arcjet";
import { validateEmail } from "@arcjet/next";

export const createClient = async (clientData) => {
    try {
        const emailAj = aj.withRule(
            validateEmail({ mode: "DRY_RUN", deny: ["DISPOSABLE", "INVALID"] })
        );
        const decision = await emailAj.protect({}, { email: clientData.email });
        if (decision.isDenied()) {
            throw new Error("Invalid email address");
        }
        const hashedPassword = await bcrypt.hash(clientData.password, 10);

        const client = await db.client.create({
            data: {
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                password: hashedPassword,
                department: "ADMIN",
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
        await setSession({ id: client.id, role: "client" });
        return {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            department: client.department,
        };
    } catch (err) {
        console.error("Sign-in error:", err.message);
        throw new Error(err.message || "Something went wrong during sign-in.");
    }
}

export const getPendingVisitorRequests = async (clientId, endUserId) => {
  try {
    const base = { status: "PENDING", clientId };
    let where;
    if (endUserId) {
      // for end user dashboard
      where = {
        ...base,
        endUserId,
        requestedByEndUser: false,
        approvalType: { in: ["END_USER_ONLY", "BOTH"] },
      };
    } else {
      // for client dashboard
      where = {
        ...base,
        OR: [
          { requestedByEndUser: true },
          {
            requestedByGuard: true,
            OR: [
              { approvalType: null },
              { approvalType: "CLIENT_ONLY" },
              { approvalType: "BOTH" },
            ],
          },
        ],
      };
    }
    const visitors = await db.visitor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return visitors;
  } catch (error) {
    console.error("Error fetching pending visitors:", error);
    throw new Error("Could not fetch pending visitor requests.");
  }
};

export const approveVisitorRequest = async ({
  visitorId,
  durationHours,
  durationMinutes,
  byClient = true,
}) => {
  try {
    const now = new Date();
  const existing = await db.visitor.findUnique({
    where: { id: visitorId },
    select: {
      requestedByGuard: true,
      requestedByEndUser: true,
      scheduledExit: true,
      name: true,
    },
  });

    if (!existing) throw new Error("Visitor not found");

    if (existing.requestedByEndUser) {
    await db.visitor.update({
      where: { id: visitorId },
      data: { status: "SCHEDULED", approvedByClient: byClient },
    });
    await createAlert({
      visitorId,
      type: "SCHEDULED",
      message: `Visit request for ${existing.name} approved`,
    });
    return { success: true };
  }

    let scheduledExit;
    if (durationHours !== undefined || durationMinutes !== undefined) {
      scheduledExit = new Date(
        now.getTime() + (durationHours || 0) * 60 * 60 * 1000 +
          (durationMinutes || 0) * 60 * 1000
      );
    } else {
      scheduledExit = existing.scheduledExit ?? now;
    }

    await db.visitor.update({
      where: { id: visitorId },
      data: {
        status: existing.requestedByGuard ? "CHECKED_IN" : "APPROVED",
        scheduledEntry: now,
        scheduledExit,
        approvedByClient: byClient,
        checkInTime: existing.requestedByGuard ? now : undefined,
      },
    });

    await createAlert({
      visitorId,
      type: existing.requestedByGuard ? "CHECKED_IN" : "SCHEDULED",
      message: existing.requestedByGuard
        ? `${existing.name} checked in`
        : `${existing.name} visit approved`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error approving visitor:", error);
    throw new Error("Could not approve visitor request.");
  }
};

export const denyVisitorRequest = async (visitorId) => {
  try {
    const visitor = await db.visitor.update({
      where: { id: visitorId },
      data: { status: "DENIED" },
    });

    await createAlert({
      visitorId: visitor.id,
      type: "DENIED",
      message: `${visitor.name} visit denied`,
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
  department,
  scheduledEntry,
  scheduledExit,
  clientId,
}) => {
  try {
    const endUser = await db.endUser.findFirst({
      where: { clientId, department },
    });
    const visitor = await db.visitor.create({
      data: {
        name,
        purpose,
        scheduledEntry: new Date(scheduledEntry),
        scheduledExit: new Date(scheduledExit),
        clientId,
        phone,
        department,
        endUserId: endUser?.id ?? null,
        endUserName: endUser?.name ?? null,
        requestedByEndUser: false,
        requestedByGuard: false,
        approvedByClient: true,
        status: "SCHEDULED",
      },
    });
    await createAlert({
      visitorId: visitor.id,
      type: "SCHEDULED",
      message: `${visitor.name} visit scheduled`,
    });

    return visitor;
  } catch (err) {
    console.error("Failed to add visitor:", err);
    throw new Error("Could not add visitor.");
  }
};

export const addContractorByClient = async ({
  name,
  phone,
  materialType,
  scheduledEntry,
  scheduledExit,
  clientId,
}) => {
  try {
    const contractor = await db.visitor.create({
      data: {
        name,
        phone,
        materialType,
        scheduledEntry: new Date(scheduledEntry),
        scheduledExit: new Date(scheduledExit),
        clientId,
        requestedByGuard: false,
        requestedByEndUser: false,
        approvedByClient: true,
        isContractor: true,
        status: "SCHEDULED",
      },
    });
    await createAlert({
      visitorId: contractor.id,
      type: "SCHEDULED",
      message: `${contractor.name} contractor scheduled`,
    });
    return contractor;
  } catch (err) {
    console.error("Failed to add contractor:", err);
    throw new Error("Could not add contractor.");
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
        requestedByGuard: true,
        requestedByEndUser: true,
        department: true,
        endUserName: true,
        endUserId: true,
        approvedByClient: true,
        vehicleImage: true,
        status: true,
        createdAt: true,
      },
    });

    return visitors.map((visitor) => ({
      id: visitor.id,
      name: visitor.name,
      vehicleImage: visitor.vehicleImage ?? null,
      purpose: visitor.purpose,
      department: visitor.department ?? "-",
      endUserName: visitor.endUserName ?? "-",
      date: visitor.requestedByGuard
        ? new Date(visitor.createdAt).toLocaleDateString()
        : visitor.scheduledEntry?.toLocaleDateString() ?? "-",
      scheduledCheckIn: visitor.scheduledEntry
        ? new Date(visitor.scheduledEntry).toLocaleTimeString()
        : "-",
      scheduledCheckOut: visitor.scheduledExit
        ? new Date(visitor.scheduledExit).toLocaleTimeString()
        : "-",
      checkInDate: visitor.checkInTime
        ? new Date(visitor.checkInTime).toLocaleDateString()
        : "-",
      checkInTime: visitor.checkInTime
        ? new Date(visitor.checkInTime).toLocaleTimeString()
        : "-",
      checkOutTime: visitor.checkOutTime
        ? new Date(visitor.checkOutTime).toLocaleTimeString()
        : "-",
      approvedBy:
        visitor.approvedByClient === null
          ? "-"
          : visitor.approvedByClient
          ? "Client"
          : visitor.department,
      status: visitor.status,
    }));
  } catch (err) {
    throw new Error("Failed to retrieve visitor records.");
  }
};

export const getAllContractorRecords = async (clientId) => {
  try {
    const contractors = await db.visitor.findMany({
      where: { clientId, isContractor: true },
      orderBy: { createdAt: "desc" },
    });

    return contractors.map((c) => ({
      id: c.id,
      name: c.name,
      materialType: c.materialType ?? "NONE",
      vehicleImage: c.vehicleImage ?? null,
      date: c.requestedByGuard
        ? new Date(c.createdAt).toLocaleDateString()
        : c.scheduledEntry?.toLocaleDateString() ?? "-",
      scheduledCheckIn: c.scheduledEntry
        ? new Date(c.scheduledEntry).toLocaleTimeString()
        : "-",
      scheduledCheckOut: c.scheduledExit
        ? new Date(c.scheduledExit).toLocaleTimeString()
        : "-",
      checkInDate: c.checkInTime
        ? new Date(c.checkInTime).toLocaleDateString()
        : "-",
      checkInTime: c.checkInTime
        ? new Date(c.checkInTime).toLocaleTimeString()
        : "-",
      checkOutTime: c.checkOutTime
        ? new Date(c.checkOutTime).toLocaleTimeString()
        : "-",
      status: c.status,
    }));
  } catch (err) {
    throw new Error("Failed to retrieve contractor records.");
  }
};






