import ChapterDocument from "@/components/ChapterDocument";
import ChapterHeader from "@/components/ChapterHeader";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapters = piece.children || [];
  return (
    <>
      <div className="w-full max-w-[54em] flex flex-col gap-6">
        {chapters.map((chapter, index) => (
          <div key={chapter.hash} className="bg-card rounded relative">
            <div className="absolute -top-[3.2em]" id={chapter.id} />
            <ChapterHeader name={chapter.name} index={index + 1} />
            <ChapterDocument chapter={chapter} />
          </div>
        ))}
      </div>
    </>
  );
}

export const generateStaticParams = generateStaticParamsCommon("doc");
