import ChapterHeader from "@/components/ChapterHeader";
import SlideGrid from "@/components/SlideGrid";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { attachmentUrl } from "@/lib/urls";
import { showExecutionTime } from "@/lib/utils";
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
  const len = piece.children?.length || 0;
  for (let i = 0; i < len; i++) {
    const chapter = piece.children![i];
    const slides = await data.getPieceAttachmentList(chapter, "slide");
    result.push(
      <div className="bg-card rounded min-h-[6em]">
        <ChapterHeader name={chapter.name} index={i + 1} />
        <SlideGrid slides={slides.map((ref) => attachmentUrl(ref))} />
      </div>
    );
  }
  return <div className="flex flex-col gap-2">{result}</div>;
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await data.getPiece([env.COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await data.getAllIdpaths(course.idpath);
  }, "slides");

  return idpaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
}
