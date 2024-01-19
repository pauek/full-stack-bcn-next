import ChapterPageBody from "@/components/ChapterPageBody";
import {
    getAllChapterParams
} from "@/lib/files/files";

export async function generateStaticParams() {
  return await getAllChapterParams(process.env.COURSE!);
}

export default async function Page({ params }: any) {
  const { courseId, partId, sessionId, chapterId } = params;
  const path = [courseId, partId, sessionId, chapterId];
  return <ChapterPageBody idpath={path} />;
}
