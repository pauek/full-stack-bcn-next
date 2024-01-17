import { getChapter, getChapterSlideList } from "@/lib/content";
import { respondSlide } from "@/lib/http-responses";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
    slideName: string;
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { partId, sessionId, chapterId, slideName } = context.params;
  return respondSlide([partId, sessionId, chapterId], slideName);
}

export async function generateStaticParams({ params }: Context) {
  const { partId, sessionId, chapterId } = params;
  const chapter = await getChapter([partId, sessionId, chapterId]);
  if (chapter === null) {
    return [];
  }
  const slideList = await getChapterSlideList(chapter);
  if (slideList === null) {
    return [];
  }
  return slideList.map((slideName) => ({ slideName }));
}
