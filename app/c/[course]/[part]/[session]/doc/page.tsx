import ChapterDocument from "@/components/ChapterDocument";
import ChapterHeader from "@/components/ChapterHeader";
import { generateStaticParamsCommon } from "../static-params";
import { SessionPageProps, getPieceOrNotFound } from "../common";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceOrNotFound({ params });
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

export const generateStaticParams = generateStaticParamsCommon("doc");