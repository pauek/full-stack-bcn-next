import { generateAllChapterParams } from "@/lib/generate";
import { respond } from "@/lib/http-responses";
import { getChapter } from "files";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};
export async function GET(req: NextRequest, { params }: Context) {
  const { partId, sessionId, chapterId } = params;
  return respond([partId, sessionId, chapterId], getChapter);
}

export async function generateStaticParams() {
  return generateAllChapterParams();
}
