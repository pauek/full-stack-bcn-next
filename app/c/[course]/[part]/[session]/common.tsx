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

export const getAttachments = async (piece: ContentPiece, filetype: FileType) => {
  const children = piece.children || [];

  const result = await Promise.allSettled(
    children.map(async (chapter) => ({
      chapter,
      attachments: await unstable_cache(
        async () => await data.getPieceAttachmentList(chapter, filetype),
        [chapter.hash, filetype.toString()]
      )(),
    }))
  );

  return result.filter(isFulfilled).map((res) => res.value);
};
