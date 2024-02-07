import { FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { isFulfilled } from "@/lib/utils";
import { notFound } from "next/navigation";

export type SessionPageProps = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export const getPieceOrNotFound = async ({ params }: SessionPageProps) => {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const piece = await data.getPieceWithChildren(idpath);
  if (piece === null) {
    notFound();
  }
  return piece;
};

export const getAttachments = async (piece: ContentPiece, filetype: FileTypeEnum) => {
  const children = piece.children || [];

  const result = await Promise.allSettled(
    children.map(async (chapter) => ({
      chapter,
      attachments: await data.getPieceAttachmentList(chapter, filetype),
    }))
  );

  return result.filter(isFulfilled).map((res) => res.value);
};
