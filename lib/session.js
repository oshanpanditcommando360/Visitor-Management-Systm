import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "session";

export async function setSession(data) {
  const token = jwt.sign(data, process.env.JWT_SECRET || "secret");
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function getSessionData() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
