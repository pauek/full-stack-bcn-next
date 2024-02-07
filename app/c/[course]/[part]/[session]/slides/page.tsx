import SlideGrid from "@/components/ChapterSlideGrid";
import data from "@/lib/data";
import { attachmentUrl } from "@/lib/urls";
import { notFound } from "next/navigation";
import React from "react";

type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};

export default async function Page({ params }: _Props) {
  const { course, part, session } = params;
  const idpath = [course, part, session];
  const piece = await data.getPieceWithChildren(idpath);

  if (piece === null) {
    notFound();
  }

  const result: React.ReactNode[] = [];
  for (const chapter of piece.children || []) {
    const slides = await data.getPieceAttachmentList(chapter, "slide");
    result.push(
      <div>
        <h2>{chapter.name}</h2>
        <SlideGrid slides={slides.map((ref) => attachmentUrl(ref))} />
      </div>
    );
  }
  return result;
}
