import backend from "@/lib/backend";
import { walkContentPieces } from "@/lib/files/hashes";
import { mimeTypes } from "@/lib/mime-types";
import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

/* URL: /img/[...idpath]/[filename] */

type RouteParams = {
  params: {
    parts: string[];
  };
};

export async function GET(_: NextRequest, { params: { parts } }: RouteParams) {
  const idpath = parts.slice(0, parts.length - 1);
  const [filename] = parts.slice(-1);

  const chapter = await backend.getPieceWithChildren(idpath);
  if (!chapter) {
    notFound();
  }
  const extension = extname(filename);
  const imagePath = `${chapter.diskpath}/images/${filename}`;
  const imageBytes = await readFile(imagePath);
  return new NextResponse(imageBytes, {
    headers: {
      "Content-Type": mimeTypes[extension] ?? "image/*",
    },
  });
}

export async function generateStaticParams() {
  const course = await backend.getPiece([process.env.COURSE!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await walkContentPieces(course, async (piece, _) => {
    const images = await backend.getPieceImageList(piece);
    if (images) {
      for (const image of images) {
        imagePaths.push({ parts: [...piece.idpath, image] });
      }
    }
  });
  return imagePaths;
}
