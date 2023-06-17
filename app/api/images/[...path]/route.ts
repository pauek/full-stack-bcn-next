import { NextRequest } from "next/server";

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
  return fetch(`${CONTENT_SERVER}/${path.join("/")}`);
}

export async function generateStaticParams() {
  const response = await fetch(`${CONTENT_SERVER}/images`);
  const allImagePaths: string[] = await response.json();
  return allImagePaths.map(path => ({
    path: path.split("/")
  }))
}