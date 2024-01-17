import { getCourse } from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const course = await getCourse();
  return NextResponse.json(course);
}
