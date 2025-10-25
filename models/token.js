import jwt from "jsonwebtoken";
import { envGet } from "../config.js";

const secret = envGet("JWT_SECRET");

export function createToken(payload) {
  if (!secret) {
    throw new Error("❌ JWT_SECRET is not defined in .env");
  }

  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export async function getToken(token) {
  if (!secret) {
    throw new Error("❌ JWT_SECRET is not defined in .env");
  }

  return jwt.verify(token, secret);
}

export async function readToken(token) {
  if (!secret) {
    throw new Error("❌ JWT_SECRET is not defined in .env");
  }

  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    throw new Error("❌ Invalid or expired token");
  }
}
