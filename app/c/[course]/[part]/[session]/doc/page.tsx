import ChapterDocument from "@/components/ChapterDocument";
import ChapterHeader from "@/components/ChapterHeader";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
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
  return (
    <div className="m-auto max-w-[54em] flex flex-col gap-6">
      {piece.children?.map((chapter, index) => (
        <div key={chapter.hash} className="bg-card rounded">
          <ChapterHeader name={chapter.name} index={index+1} />
          <ChapterDocument chapter={chapter} />
        </div>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  let idpaths: string[][] = [];

  await showExecutionTime(async () => {
    const course = await data.getPiece([env.COURSE_ID]);
    if (!course) {
      return [];
    }
    idpaths = await data.getAllIdpaths(course.idpath);
  }, "docs");

  return idpaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }));
}
