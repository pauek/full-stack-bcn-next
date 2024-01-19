import {
  getPieceWithChildren,
  getPieceCoverImage,
} from "@/lib/files/files";
import { mimeTypes } from "@/lib/mime-types";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

type RouteParams = {
  params: {
    parts: string[],
  };
};
export async function GET(_: Request, { params }: RouteParams) {
  const session = await getPieceWithChildren(params.parts);
  if (!session) {
    notFound();
  }
  const cover = await getPieceCoverImage(session);
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
