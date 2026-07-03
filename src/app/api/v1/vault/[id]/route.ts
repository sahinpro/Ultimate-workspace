import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { vaultItemSchema } from "@/lib/validations/schemas";
import { deleteVaultItem, getVaultItemDecrypted, updateVaultItem } from "@/server/services/vault.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const item = await getVaultItemDecrypted(session.user.id, id);
    return NextResponse.json(apiSuccess(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = vaultItemSchema.partial().parse(await req.json());
    const item = await updateVaultItem(session.user.id, id, body);
    return NextResponse.json(apiSuccess(item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await deleteVaultItem(session.user.id, id);
    return NextResponse.json(apiSuccess({ deleted: true }));
  } catch (error) {
    return handleApiError(error);
  }
}
