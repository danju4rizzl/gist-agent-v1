import { NextRequest, NextResponse } from "next/server";
import { createRun, listRuns } from "@/db/queries";
import { tasks } from "@trigger.dev/sdk/v3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const allRuns = await listRuns(limit, offset);
  return NextResponse.json(allRuns);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const keyword = body.keyword?.trim();

  if (!keyword) {
    return NextResponse.json(
      { error: "Keyword is required" },
      { status: 400 }
    );
  }

  const run = await createRun(keyword, "ui");

  const handle = await tasks.trigger("gist-agent-orchestrator", {
    keyword,
    runId: run.id,
    source: "ui",
  });

  return NextResponse.json({
    run,
    triggerRunId: handle.id,
  });
}
