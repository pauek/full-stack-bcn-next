import { pieceUrlPath } from "@/lib/urls";
import Link from "next/link";
import { SessionPageProps, _generateStaticParams, getPieceWithChildrenOrNotFound } from "./utils";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapters = piece.children || [];
  return (
    <div className="w-full max-w-[54em] flex flex-col gap-6">
      {chapters.map(
        (chapter) =>
          chapter.metadata.hidden || <Link href={pieceUrlPath(chapter.idpath)}>{chapter.name}</Link>
      )}
    </div>
  );
}

export const generateStaticParams = _generateStaticParams;
