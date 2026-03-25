import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";

export const ADMIN_COOKIE_NAME = "dmps_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface StoredPin {
  salt: string;
  hash: string;
  updatedAt: string;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function hashPin(pin: string, salt: string) {
  return pbkdf2Sync(pin, salt, 120000, 64, "sha512").toString("hex");
}

async function getStoredPin() {
  return readJsonFile<StoredPin | null>("admin-pin.json", null);
}

function getEnvPin() {
  return process.env.ADMIN_PIN ?? process.env.ADMIN_SECRET ?? "";
}

async function getPinFingerprint() {
  const stored = await getStoredPin();

  if (stored?.hash) {
    return stored.hash;
  }

  return createHmac("sha256", "dmps-pin-fingerprint")
    .update(getEnvPin())
    .digest("hex");
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PIN ??
    process.env.ADMIN_SECRET ??
    "dmps-default-session-secret"
  );
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export async function verifyAdminPin(pin: string) {
  const stored = await getStoredPin();

  if (stored?.salt && stored?.hash) {
    return safeEqual(hashPin(pin, stored.salt), stored.hash);
  }

  const envPin = getEnvPin();
  if (!envPin) {
    return false;
  }

  return safeEqual(pin, envPin);
}

export async function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = createHmac("sha256", getSessionSecret())
    .update(`${payload}.${await getPinFingerprint()}`)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string) {
  const [expiresAtRaw, nonce, signature] = token.split(".");

  if (!expiresAtRaw || !nonce || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const payload = `${expiresAtRaw}.${nonce}`;
  const expected = createHmac("sha256", getSessionSecret())
    .update(`${payload}.${await getPinFingerprint()}`)
    .digest("hex");

  return safeEqual(signature, expected);
}

export async function isAdminAuthorized(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (sessionToken && (await verifyAdminSessionToken(sessionToken))) {
    return true;
  }

  const fallbackKey = request.headers.get("x-admin-key");

  if (fallbackKey && (await verifyAdminPin(fallbackKey))) {
    return true;
  }

  return false;
}

export async function changeAdminPin(currentPin: string, newPin: string) {
  const isValidCurrentPin = await verifyAdminPin(currentPin);

  if (!isValidCurrentPin) {
    return false;
  }

  const salt = randomBytes(16).toString("hex");
  const hash = hashPin(newPin, salt);

  await writeJsonFile<StoredPin>("admin-pin.json", {
    salt,
    hash,
    updatedAt: new Date().toISOString()
  });

  return true;
}