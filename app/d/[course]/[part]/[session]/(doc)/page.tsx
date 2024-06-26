import Chapter from "@/components/Chapter";
import { SessionPageProps, getPieceWithChildrenOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapters = piece.children || [];
  return (
    <div className="w-full max-w-[54rem] flex flex-col gap-6">
      {chapters.map(
        (chapter) => chapter.metadata.hidden || <Chapter key={chapter.hash} chapter={chapter} />
      )}
    </div>
  );
}

export const generateStaticParams = generateStaticParamsCommon;
