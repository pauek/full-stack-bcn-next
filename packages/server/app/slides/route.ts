import * as content from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";

// List all image paths
export async function GET(req: NextRequest) {
  const allSlidePaths = await content.getAllFilePaths("slides", [".svg"]);
  return NextResponse.json(allSlidePaths);
}
