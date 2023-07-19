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
    const item = await getContentItem(["fullstack", ...path.slice(0, i)]);
    console.log(item);
    crumbs.push(item.name);
  }
  return NextResponse.json(crumbs);
}
