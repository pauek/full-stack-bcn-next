import Chapter from "@/components/Chapter";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { ChapterPageProps, getChapterOrNotFound } from "./utils";

export default async function Page({ params }: ChapterPageProps) {
  const chapter = await getChapterOrNotFound({ params });
  return chapter.metadata.hidden || <Chapter key={chapter.hash} chapter={chapter} />;
}

export const generateStaticParams = async () => {
  const course = await data.getPiece([env.COURSE_ID]);
  if (!course) {
    return [];
  }
  return (await data.getAllIdpaths(course.idpath))
    .filter((path) => path.length === 4)
    .map(([course, part, session, chapter]) => ({ course, part, session, chapter }));
};
