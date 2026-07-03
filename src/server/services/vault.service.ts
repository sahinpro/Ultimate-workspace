import { prisma } from "@/lib/db/prisma";
import { encryptVaultPayload, decryptVaultPayload } from "@/lib/crypto/vault";
import type { VaultItemType } from "@prisma/client";

export async function listVaultItems(userId: string) {
  return prisma.vaultItem.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createVaultItem(
  userId: string,
  data: { title: string; payload: string; type?: VaultItemType },
) {
  const { encrypted, iv } = encryptVaultPayload(data.payload, userId);
  const item = await prisma.vaultItem.create({
    data: {
      userId,
      title: data.title,
      encryptedPayload: encrypted,
      iv,
      type: data.type ?? "NOTE",
    },
  });

  await prisma.auditLog.create({
    data: { userId, action: "VAULT_CREATE", resource: item.id },
  });

  return { id: item.id, title: item.title, type: item.type };
}

export async function getVaultItemDecrypted(userId: string, itemId: string) {
  const item = await prisma.vaultItem.findFirst({
    where: { id: itemId, userId, deletedAt: null },
  });
  if (!item) throw new Error("Vault item not found");

  const payload = decryptVaultPayload(item.encryptedPayload, item.iv, userId);

  await prisma.auditLog.create({
    data: { userId, action: "VAULT_READ", resource: item.id },
  });

  return { ...item, payload };
}

export async function updateVaultItem(
  userId: string,
  itemId: string,
  data: { title?: string; payload?: string; type?: VaultItemType },
) {
  const item = await prisma.vaultItem.findFirst({
    where: { id: itemId, userId, deletedAt: null },
  });
  if (!item) throw new Error("Vault item not found");

  let encryptedPayload = item.encryptedPayload;
  let iv = item.iv;
  if (data.payload) {
    const enc = encryptVaultPayload(data.payload, userId);
    encryptedPayload = enc.encrypted;
    iv = enc.iv;
  }

  const updated = await prisma.vaultItem.update({
    where: { id: itemId },
    data: {
      title: data.title,
      type: data.type,
      encryptedPayload,
      iv,
    },
  });

  await prisma.auditLog.create({
    data: { userId, action: "VAULT_UPDATE", resource: itemId },
  });

  return updated;
}

export async function deleteVaultItem(userId: string, itemId: string) {
  const item = await prisma.vaultItem.findFirst({
    where: { id: itemId, userId, deletedAt: null },
  });
  if (!item) throw new Error("Vault item not found");

  await prisma.auditLog.create({
    data: { userId, action: "VAULT_DELETE", resource: itemId },
  });

  return prisma.vaultItem.update({
    where: { id: itemId },
    data: { deletedAt: new Date() },
  });
}
