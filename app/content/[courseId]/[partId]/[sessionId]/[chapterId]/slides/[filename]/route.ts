import { getPieceWithChildren } from "@/lib/files/files";
import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

const mimeType: Record<string, string> = {
  svg: "image/svg+xml",
  jpg: "image/jpeg",
  png: "image/png",
};

type RouteParams = {
  params: {
    courseId: string;
    partId: string;
    sessionId: string;
    chapterId: string;
    filename: string;
  };
};
export async function GET(req: NextRequest, { params }: RouteParams) {
  const chapter = await getPieceWithChildren([
    params.courseId,
    params.partId,
    params.sessionId,
    params.chapterId,
  ]);
  if (!chapter) {
    notFound();
  }
  const imagePath = `${chapter.diskpath}/slides/${params.filename}`;
  const extension = extname(params.filename);
  const imageData = await readFile(imagePath);
  return new NextResponse(imageData.buffer, {
    headers: {
      "Content-Type": mimeType[extension] ?? "image/*",
    },
  });
}
