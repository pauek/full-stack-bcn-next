import data from "@/lib/data";
import {
  cachedGetPiece,
  cachedGetPieceFileData,
  cachedGetPieceSlideList,
  cachedGetPieceWithChildren,
} from "@/lib/data/cached";
import { mimeTypes } from "@/lib/mime-types";
import { showExecutionTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

type RouteParams = {
  params: {
    parts: string[];
  };
};

export async function GET(_: NextRequest, { params: { parts } }: RouteParams) {
  const idpath = parts.slice(0, parts.length - 1);
  const [filename] = parts.slice(-1);

  const piece = await cachedGetPieceWithChildren(idpath);
  if (!piece) {
    notFound();
  }
  const fileData = await cachedGetPieceFileData(piece, filename, "slide");
  const extension = extname(filename);

  return new NextResponse(fileData, {
    headers: {
      "Content-Type": mimeTypes[extension] ?? "image/*",
    },
  });
}

export async function generateStaticParams() {
  const slidePaths: { parts: string[] }[] = [];

  await showExecutionTime(async () => {
    const course = await cachedGetPiece([process.env.COURSE_ID!]);
    if (!course) {
      return [];
    }
    await data.walkContentPieces(course, async (piece) => {
      const slideList = await cachedGetPieceSlideList(piece);
      for (const slide of slideList) {
        slidePaths.push({ parts: [...piece.idpath, slide.name] });
      }
    });
  }, "slides");

  return slidePaths;
}
