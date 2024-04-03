import data from "@/lib/data";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

export type ChapterPageProps = {
  params: {
    course: string;
    part: string;
    session: string;
    chapter: string;
  };
};

export const getChapterOrNotFound = async ({ params }: ChapterPageProps) => {
  const { course, part, session, chapter } = params;
  const idpath = [course, part, session, chapter];
  const piece = await unstable_cache(
    async () => await data.getPieceWithChildren(idpath),
    ["piece-with-children", idpath.join("/")]
  )();
  if (piece === null) {
    notFound();
  }
  return piece;
};
