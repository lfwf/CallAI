import { NextResponse } from "next/server";
import candidates from "../../../../../content/candidates.json";

export async function POST(request, { params }) {
  const { id } = await params;
  const candidate = candidates.find((item) => item.id === id);

  if (!candidate) {
    return NextResponse.json({ error: "candidate not found" }, { status: 404 });
  }

  const draft = {
    id: candidate.id,
    title: candidate.title,
    sourceUrl: candidate.sourceUrl,
    status: "draft",
    generatedFrom: "candidate-review",
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ success: true, draft });
}
