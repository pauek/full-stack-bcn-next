import { getContentItem } from "@/lib/content-server";
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: {
    path: string[];
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { path } = context.params;
  const crumbs = [];
  console.log("Path =", path);
  for (let i = 1; i <= path.length; i++) {
    const partialPath = path.slice(0, i);
    const fullpath = ["fullstack", ...partialPath];
    const item = await getContentItem(fullpath);
    console.log(item);
    crumbs.push({ name: item.name, path: partialPath });
  }
  return NextResponse.json(crumbs);
}
