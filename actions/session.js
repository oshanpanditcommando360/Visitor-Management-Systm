"use server";
import { db } from "@/lib/prisma";
import { getSessionData, clearSession } from "@/lib/session";

export const getCurrentClient = async () => {
  const session = getSessionData();
  if (!session || session.role !== "client") return null;
  const c = await db.client.findUnique({ where: { id: session.id } });
  if (!c) return null;
  return {
    clientId: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    department: c.department,
  };
};

export const getCurrentEndUser = async () => {
  const session = getSessionData();
  if (!session || session.role !== "enduser") return null;
  const u = await db.endUser.findUnique({ where: { id: session.id } });
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    post: u.post,
    approvalType: u.approvalType,
    canAddVisitor: u.canAddVisitor,
    clientId: u.clientId,
  };
};

export const signOut = async () => {
  clearSession();
  return { success: true };
};
