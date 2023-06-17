import { NextRequest, NextResponse } from "next/server";

// Hago este endpoint para que Next cachee las imágenes
// y no las sirva desde el content-server.

const { CONTENT_SERVER } = process.env;

type Context = {
  params: {
    path: string[];
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { path } = context.params;
  const response = await fetch(`${CONTENT_SERVER}/${path.join("/")}`);
  const bytes = await response.blob();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("Content-Type")!,
    }
  })
}

export async function generateStaticParams() {
  const response = await fetch(`${CONTENT_SERVER}/images`);
  const allImagePaths: string[] = await response.json();
  return allImagePaths.map(path => ({
    path: path.split("/")
  }))
}