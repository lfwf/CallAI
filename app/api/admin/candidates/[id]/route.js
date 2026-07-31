import { NextResponse } from "next/server";
import candidates from "../../../../../content/candidates.json";

export async function GET(request, { params }) {
  const candidate = candidates.find((item) => item.id === params.id);

  if (!candidate) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(request, { params }) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    id: params.id,
    update: body
  });
}
