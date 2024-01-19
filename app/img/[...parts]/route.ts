import { getPieceWithChildren } from "@/lib/files/files";
import { mimeTypes } from "@/lib/mime-types";
import { readFile } from "fs/promises";
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

  const chapter = await getPieceWithChildren(idpath);
  if (!chapter) {
    notFound();
  }
  const extension = extname(filename);
  const imagePath = `${chapter.diskpath}/images/${filename}`;
  const imageBytes = await readFile(imagePath);
  return new NextResponse(imageBytes, {
    headers: {
      "Content-Type": mimeTypes[extension] ?? "image/*",
    },
  });
}

/*
export async function generateStaticParams() {
  
}
*/