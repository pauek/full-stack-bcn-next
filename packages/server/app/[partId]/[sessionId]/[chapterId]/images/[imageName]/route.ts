import { getChapter, getChapterImageList } from "@/lib/content";
import { respondImage } from "@/lib/http-responses";
import { NextRequest } from "next/server";

type Context = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
    imageName: string;
  };
};
export async function GET(req: NextRequest, context: Context) {
  const { partId, sessionId, chapterId, imageName } = context.params;
  return respondImage([partId, sessionId, chapterId], imageName);
}

export async function generateStaticParams({ params }: Context) {
  const { partId, sessionId, chapterId } = params;
  const chapter = await getChapter([partId, sessionId, chapterId]);
  if (chapter === null) {
    return [];
  }
  const imageList = await getChapterImageList(chapter);
  if (imageList === null) {
    return [];
  }
  return imageList.map((image) => ({ imageName: image.name }));
}
