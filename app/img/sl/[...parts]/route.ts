import data from "@/lib/data";
import { walkContentPieces } from "@/lib/data/files";
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

  const piece = await data.getPieceWithChildren(idpath);
  if (!piece) {
    notFound();
  }
  const fileData = await data.getPieceFileData(piece, filename, "slide");
  const extension = extname(filename);
  return new NextResponse(fileData, {
    headers: {
      "Content-Type": mimeType[extension] ?? "image/*",
    },
  });
}

export async function generateStaticParams() {
  const course = await data.getPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await walkContentPieces(course, async (piece, _) => {
    const slides = await data.getPieceSlideList(piece);
    if (slides) {
      for (const slide of slides) {
        imagePaths.push({ parts: [...piece.idpath, slide] });
      }
    }
  });
  return imagePaths;
}