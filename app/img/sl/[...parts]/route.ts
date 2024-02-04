import data from "@/lib/data";
import {
  cachedGetPieceFileData,
  cachedGetPieceWithChildren
} from "@/lib/data/cached";
import { COURSE_ID } from "@/lib/env";
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
  let paths: string[][] = [];

  await showExecutionTime(async () => {
    paths = await data.getAllAttachmentPaths([COURSE_ID], "slide");
  }, "slides");

  return paths.map((path) => ({ parts: path }));
}
