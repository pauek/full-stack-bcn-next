import { getAllFilePaths } from "files";
import { NextRequest, NextResponse } from "next/server";

// List all image paths
export async function GET(req: NextRequest) {
  const extensions = [".svg", ".png", ".jpg"];
  const allImagePaths = await getAllFilePaths("images", extensions);
  return NextResponse.json(allImagePaths);
}
