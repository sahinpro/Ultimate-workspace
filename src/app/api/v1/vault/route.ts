import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { vaultItemSchema } from "@/lib/validations/schemas";
import { createVaultItem, listVaultItems } from "@/server/services/vault.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const items = await listVaultItems(session.user.id);
    return NextResponse.json(apiSuccess(items));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = vaultItemSchema.parse(await req.json());
    const item = await createVaultItem(session.user.id, body);
    return NextResponse.json(apiSuccess(item), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
