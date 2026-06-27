import { NextRequest, NextResponse } from "next/server";
import { getRunWithSteps } from "@/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  
  if (!runId) {
    return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
  }

  const runWithSteps = await getRunWithSteps(runId);
  if (!runWithSteps) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(runWithSteps);
}
