import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/api/response";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.statusCode },
    );
  }
  console.error(error);
  return NextResponse.json(
    { data: null, error: "Internal server error" },
    { status: 500 },
  );
}
