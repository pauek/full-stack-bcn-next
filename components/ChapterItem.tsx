import { ContentPiece } from "@/lib/adt";
import { pieceUrl } from "@/lib/urls";
import Link from "next/link";

type ChapterItemProps = {
  index: number;
  chapter: ContentPiece;
};
export default async function ChapterItem({
  index,
  chapter,
}: ChapterItemProps) {
  const chapterUrl = pieceUrl(chapter.idpath);
  return (
    <div className="flex flex-col items-baseline">
      <div className="mr-2 text-stone-400 text-xs">CHAPTER {index}</div>
      <Link href={chapterUrl}>
        <h3>{chapter.name}</h3>
      </Link>
    </div>
  );
}
