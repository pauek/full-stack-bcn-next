import { getPieceWithChildren } from "@/lib/files/files";
import { mimeTypes } from "@/lib/mime-types";
import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// TODO: Refactor this!!

export async function GET(req: NextRequest) {
  const [_empty, _content, ...path] = req.nextUrl.pathname.split("/");
  const chapter = await getPieceWithChildren(path);
  if (!chapter) {
    notFound();
  }
  const [imageFilenameURL] = path.slice(-1);
  const imageFilename = decodeURIComponent(imageFilenameURL);
  const imageExtension = imageFilename.split(".").slice(-1)[0];
  const imagePath = `${chapter.diskpath}/images/${imageFilename}`;
  const imageBytes = await readFile(imagePath);
  return new NextResponse(imageBytes.buffer, {
    headers: {
      "Content-Type": mimeTypes[imageExtension] ?? "image/*",
    },
  });
}
