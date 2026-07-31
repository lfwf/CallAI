import { NextResponse } from "next/server";
import candidateData from "../../../../../content/candidates.json";

const candidates = candidateData.candidates || [];

export async function GET(request, { params }) {
  const { id } = await params;
  const candidate = candidates.find((item) => item.id === id);

  if (!candidate) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    success: true,
    id,
    update: body
  });
}
