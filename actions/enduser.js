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
