import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  const key = process.env.VAULT_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("VAULT_ENCRYPTION_KEY is required in production");
    }
    return createHash("sha256").update("dev-vault-key").digest();
  }
  return Buffer.from(key, "base64");
}

function deriveKey(userId: string): Buffer {
  return createHash("sha256").update(getMasterKey()).update(userId).digest();
}

export function encryptVaultPayload(plaintext: string, userId: string): { encrypted: string; iv: string } {
  const iv = randomBytes(12);
  const key = deriveKey(userId);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([encrypted, authTag]);
  return {
    encrypted: combined.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptVaultPayload(encrypted: string, iv: string, userId: string): string {
  const key = deriveKey(userId);
  const ivBuffer = Buffer.from(iv, "base64");
  const combined = Buffer.from(encrypted, "base64");
  const authTag = combined.subarray(combined.length - 16);
  const ciphertext = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function maskSecret(value: string): string {
  if (value.length <= 4) return "••••";
  return "••••" + value.slice(-4);
}
