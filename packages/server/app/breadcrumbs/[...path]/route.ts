import { generateAllChapterPaths } from "@/lib/generate";
import { getBreadcrumbs } from "files";

import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: {
    path: string[];
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { path } = context.params;
  return NextResponse.json(await getBreadcrumbs(...path));
}

export async function generateStaticParams() {
  const paths = await generateAllChapterPaths();
  return paths.map(path => ({ path }));
}