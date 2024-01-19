import {
  getPieceWithChildren,
  getPieceCoverImageData,
  getPiece,
  getPieceCoverImageFilename,
} from "@/lib/files/files";
import { walkContentPieces } from "@/lib/files/hashes";
import { mimeTypes } from "@/lib/mime-types";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

type RouteParams = {
  params: {
    parts: string[];
  };
};
export async function GET(_: Request, { params }: RouteParams) {
  const session = await getPieceWithChildren(params.parts);
  if (!session) {
    notFound();
  }
  const cover = await getPieceCoverImageData(session);
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
  const course = await getPiece([process.env.COURSE!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await walkContentPieces(course, async (piece, _) => {
    const filename = await getPieceCoverImageFilename(piece);
    if (filename) {
      imagePaths.push({ parts: [...piece.idpath] });
    }
  });
  return imagePaths;
}
