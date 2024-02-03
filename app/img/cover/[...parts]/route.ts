import data from "@/lib/data";
import { cachedGetPiece, cachedPieceHasCover } from "@/lib/data/cached";
import { mimeTypes } from "@/lib/mime-types";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

type RouteParams = {
  params: {
    parts: string[];
  };
};
export async function GET(req: NextRequest, { params }: RouteParams) {
  const piece = await data.getPieceWithChildren(params.parts);
  if (!piece) {
    notFound();
  }
  const cover = await data.getPieceCoverImageData(piece);
  if (!cover) {
    notFound();
  }
  try {
    const { buffer, name } = cover;
    const extension = extname(name);
    return new NextResponse(buffer, {
      headers: { "Content-Type": mimeTypes[extension] },
    });
  } catch (e) {
    notFound();
  }
}

export async function generateStaticParams() {
  const course = await cachedGetPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const coverPaths: { parts: string[] }[] = [];
  await data.walkContentPieces(course, async (piece) => {
    if (await cachedPieceHasCover(piece)) {
      coverPaths.push({ parts: [...piece.idpath] });
    }
  });
  return coverPaths;
}
