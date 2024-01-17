import { generateAllChapterPaths } from "@/lib/generate";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const paths = await generateAllChapterPaths();
  return NextResponse.json(paths);
}
