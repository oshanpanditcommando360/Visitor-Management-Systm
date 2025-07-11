"use server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const createEndUser = async (data) => {
  try {
    const hashed = await bcrypt.hash(data.password, 10);
    return await db.endUser.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        department: data.department,
        post: data.post,
        approvalType: data.approvalType,
        canAddVisitor: data.canAddVisitor ?? false,
        clientId: data.clientId,
      },
    });
  } catch (error) {
    console.error("Error creating end user:", error);
    throw new Error("Failed to create end user");
  }
};

export const signInEndUser = async ({ email, password }) => {
  try {
    const user = await db.endUser.findUnique({ where: { email } });
    if (!user) throw new Error("No account found with this email.");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Incorrect email/password.");
    return user;
  } catch (err) {
    console.error("Sign-in error:", err);
    throw new Error(err.message || "Sign-in failed");
  }
};

export const addVisitorByEndUser = async ({
  name,
  phone,
  purpose,
  scheduledEntry,
  scheduledExit,
  endUserId,
  clientId,
}) => {
  try {
    const endUser = await db.endUser.findUnique({ where: { id: endUserId } });
    if (!endUser) throw new Error("Invalid end user");
    const visitor = await db.visitor.create({
      data: {
        name,
        phone,
        purpose,
        department: endUser.department,
        endUserName: endUser.name,
        endUserId,
        approvalType: endUser.approvalType,
        scheduledEntry: new Date(scheduledEntry),
        scheduledExit: new Date(scheduledExit),
        clientId,
        requestedByEndUser: true,
        requestedByGuard: false,
        status: "PENDING",
      },
    });
    return visitor;
  } catch (err) {
    console.error("Failed to add visitor:", err);
    throw new Error("Could not add visitor.");
  }
};

export const getEndUserRecords = async (endUserId) => {
  try {
    const visitors = await db.visitor.findMany({
      where: { endUserId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        purpose: true,
        scheduledEntry: true,
        scheduledExit: true,
        checkInTime: true,
        checkOutTime: true,
        approvedByClient: true,
        endUserId: true,
        department: true,
        status: true,
        createdAt: true,
      },
    });
    return visitors.map((v) => ({
      id: v.id,
      name: v.name,
      date: v.scheduledEntry ? new Date(v.scheduledEntry).toLocaleDateString() : new Date(v.createdAt).toLocaleDateString(),
      scheduledCheckIn: v.scheduledEntry ? new Date(v.scheduledEntry).toLocaleTimeString() : "-",
      scheduledCheckOut: v.scheduledExit ? new Date(v.scheduledExit).toLocaleTimeString() : "-",
      checkInDate: v.checkInTime ? new Date(v.checkInTime).toLocaleDateString() : "-",
      checkInTime: v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : "-",
      checkOutTime: v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString() : "-",
      approvedBy: v.approvedByClient ? "Client" : v.department,
      status: v.status,
    }));
  } catch (err) {
    throw new Error("Failed to retrieve records.");
  }
};

export const getEndUserAlerts = async (endUserId) => {
  try {
    const alerts = await db.alert.findMany({
      where: { visitor: { endUserId } },
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
  } catch (err) {
    throw new Error("Failed to get alerts.");
  }
};

export const getEndUsersByClient = async (clientId) => {
  try {
    return await db.endUser.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to fetch end users:", err);
    throw new Error("Could not get end users");
  }
};

export const deleteEndUser = async (id) => {
  try {
    await db.endUser.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Failed to delete end user:", err);
    throw new Error("Could not delete end user");
  }
};

export const updateEndUserCredentials = async ({ id, email, password }) => {
  try {
    const data = {};
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    await db.endUser.update({ where: { id }, data });
    return { success: true };
  } catch (err) {
    console.error("Failed to update end user:", err);
    throw new Error("Could not update end user");
  }
};
