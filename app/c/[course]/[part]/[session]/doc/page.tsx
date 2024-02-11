import ChapterDocument from "@/components/ChapterDocument";
import ChapterHeader from "@/components/ChapterHeader";
import { generateStaticParamsCommon } from "../static-params";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "../common";
import Link from "next/link";
import ChapterLocalLinks from "@/components/ChapterLocalLinks";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapters = piece.children || [];
  return (
    <>
      <div className="m-auto max-w-[54em] flex flex-col gap-6">
        {chapters.map((chapter, index) => (
          <div key={chapter.hash} className="bg-card rounded relative">
            <div className="absolute -top-[3.2em] border border-red-500" id={chapter.id} />
            <ChapterHeader name={chapter.name} index={index + 1} />
            <ChapterDocument chapter={chapter} />
          </div>
        ))}
      </div>
    </>
  );
}

export const generateStaticParams = generateStaticParamsCommon("doc");
