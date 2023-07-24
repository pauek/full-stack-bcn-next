import { NextRequest, NextResponse } from "next/server";

// Hago este endpoint para que Next cachee las imágenes
// y no las sirva desde el content-server.

type Context = {
  params: {
    path: string[];
  };
};
export async function GET(_: NextRequest, context: Context) {
  const { path } = context.params;
  const url = new URL(`${process.env.CONTENT_SERVER}/${path.join("/")}`);
  const response = await fetch(url);
  const blob = await response.blob();
  return new NextResponse(blob, {
    status: 200,
    headers: { "Content-Type": response.headers.get("Content-Type")! },
  });
}
