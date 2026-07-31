import { NextResponse } from "next/server";
import reviews from "../../../../../../content/reviews.json";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const review = {
    candidateId: id,
    ...body,
    updatedAt: new Date().toISOString()
  };

  reviews.push(review);

  return NextResponse.json({ success: true, review });
}
