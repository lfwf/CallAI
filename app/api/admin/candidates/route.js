import { NextResponse } from "next/server";
import candidates from "../../../../content/candidates.json";

export async function GET() {
  return NextResponse.json(candidates);
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    message: "candidate draft received",
    candidate: body
  });
}
