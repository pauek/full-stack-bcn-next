import { getAllFilePaths } from "files";
import { NextRequest, NextResponse } from "next/server";

// List all image paths
export async function GET(req: NextRequest) {
  const allSlidePaths = await getAllFilePaths("slides", [".svg"]);
  return NextResponse.json(allSlidePaths);
}
