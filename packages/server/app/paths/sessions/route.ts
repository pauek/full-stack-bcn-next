import { getAllSessionPaths } from "files";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(await getAllSessionPaths());
}
