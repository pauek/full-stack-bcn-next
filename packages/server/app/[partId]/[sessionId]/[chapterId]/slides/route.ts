import { generateAllChapterParams } from "@/lib/content";
import { respondSlideList } from "@/lib/http-responses";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { partId, sessionId, chapterId } = context.params;
  return respondSlideList(partId, sessionId, chapterId);
}

export async function generateStaticParams() {
  return generateAllChapterParams();
}