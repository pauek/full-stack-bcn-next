import backend from "@/lib/backend";
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
  const session = await backend.getPieceWithChildren(params.parts);
  if (!session) {
    notFound();
  }
  const cover = await backend.getPieceCoverImageData(session);
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
  const course = await backend.getPiece([process.env.COURSE!]);
  if (!course) {
    return [];
  }
  const imagePaths: { parts: string[] }[] = [];
  await walkContentPieces(course, async (piece, _) => {
    const filename = await backend.getPieceCoverImageFilename(piece);
    if (filename) {
      imagePaths.push({ parts: [...piece.idpath] });
    }
  });
  return imagePaths;
}
