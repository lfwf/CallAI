import drafts from "../../../../content/drafts.json";

export async function GET() {
  return Response.json(drafts);
}
