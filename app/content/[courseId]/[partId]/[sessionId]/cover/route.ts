import {
  getPieceWithChildren,
  getPieceCoverImage,
} from "@/lib/files/files";
import { mimeTypes } from "@/lib/mime-types";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

type RouteParams = {
  params: {
    courseId: string;
    partId: string;
    sessionId: string;
  };
};
export async function GET(_: Request, { params }: RouteParams) {
  const session = await getPieceWithChildren([
    params.courseId,
    params.partId,
    params.sessionId,
  ]);
  if (!session) {
    notFound();
  }
  const cover = await getPieceCoverImage(session);
  if (!cover) {
    notFound();
  }
  try {
    const { data, extension } = cover;
    return new NextResponse(data.buffer, {
      headers: { "Content-Type": mimeTypes[extension] },
    });
  } catch (e) {
    notFound();
  }
}
