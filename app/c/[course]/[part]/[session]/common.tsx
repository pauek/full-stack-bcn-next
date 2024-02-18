import { FileType } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { isFulfilled } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

export type SessionPageProps = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export const getPieceWithChildrenOrNotFound = async ({ params }: SessionPageProps) => {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const piece = await unstable_cache(
    async () => await data.getPieceWithChildren(idpath),
    ["piece-with-children", idpath.join("/")]
  )();
  if (piece === null) {
    notFound();
  }
  return piece;
};

export const getAllChapterAttachments = async (piece: ContentPiece, filetype: FileType) => {
  const children = piece.children || [];
  if (children.length === 0) {
    return [];
  }
  return unstable_cache(async () => {
    const result = await Promise.allSettled(
      children.map(async (chapter) => ({
        chapter,
        attachments: await data.getPieceAttachmentList(chapter, filetype),
      }))
    );
    return result.filter(isFulfilled).map((res) => res.value);
  }, [`${piece.hash}/chapter-attachments/${filetype}`])();
};
