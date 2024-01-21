import data from "@/lib/data";
import { mimeTypes } from "@/lib/mime-types";
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

  const chapter = await data.getPieceWithChildren(idpath);
  if (!chapter) {
    notFound();
  }
  const fileBytes = await data.getPieceFileData(chapter, filename, "image");
  const extension = extname(filename);
  return new NextResponse(fileBytes, {
    headers: {
      "Content-Type": mimeTypes[extension] ?? "image/*",
    },
  });
}

export async function generateStaticParams() {
  const course = await data.getPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await data.walkContentPieces(course, async (piece) => {
    const images = await data.getPieceImageList(piece);
    if (images) {
      for (const image of images) {
        imagePaths.push({ parts: [...piece.idpath, image] });
      }
    }
  });
  return imagePaths;
}
