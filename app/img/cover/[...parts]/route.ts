import data from "@/lib/data";
import { mimeTypes } from "@/lib/mime-types";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

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
    const { data, extension } = cover;
    return new NextResponse(data, {
      headers: { "Content-Type": mimeTypes[extension] },
    });
  } catch (e) {
    notFound();
  }
}

export async function generateStaticParams() {
  const course = await data.getPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await data.walkContentPieces(course, async (piece) => {
    if (await data.pieceHasCover(piece)) {
      imagePaths.push({ parts: [...piece.idpath] });
    }
  });
  return imagePaths;
}
