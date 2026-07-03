import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api/auth-guard";
import { apiSuccess } from "@/lib/api/response";
import { getProfile, updateProfile } from "@/server/actions/profile.actions";

export async function GET() {
  try {
    await requireAuth();
    const profile = await getProfile();
    return NextResponse.json(apiSuccess(profile));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const profile = await updateProfile(body);
    return NextResponse.json(apiSuccess(profile));
  } catch (error) {
    return handleApiError(error);
  }
}
