import { getPiece, getPieceSlideList, getPieceWithChildren } from "@/lib/files/files";
import { walkContentPieces } from "@/lib/files/hashes";
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
    parts: string[];
  };
};

export async function GET(_: NextRequest, { params: { parts } }: RouteParams) {
  const idpath = parts.slice(0, parts.length - 1);
  const [filename] = parts.slice(-1);

  const chapter = await getPieceWithChildren(idpath);
  if (!chapter) {
    notFound();
  }
  const imagePath = `${chapter.diskpath}/slides/${filename}`;
  const extension = extname(filename);
  const imageData = await readFile(imagePath);
  return new NextResponse(imageData, {
    headers: {
      "Content-Type": mimeType[extension] ?? "image/*",
    },
  });
}

export async function generateStaticParams() {
  const course = await getPiece([process.env.COURSE!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await walkContentPieces(course, async (piece, _) => {
    const slides = await getPieceSlideList(piece);
    if (slides) {
      for (const slide of slides) {
        imagePaths.push({ parts: [...piece.idpath, slide] });
      }
    }
  });
  return imagePaths;
}