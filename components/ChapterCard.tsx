import { Chapter } from "@/lib/adt";
import Link from "next/link";

type ChapterItemProps = {
  index: number;
  chapter: Chapter;
};
export default async function ChapterItem({
  index,
  chapter,
}: ChapterItemProps) {
  const chapterUrl = `/content/${chapter.path.join("/")}`;
  return (
    <div className="flex flex-col items-baseline">
      <div className="mr-2 text-stone-400 text-xs">CHAPTER {index}</div>
      <Link href={chapterUrl}>
        <h3>{chapter.name}</h3>
      </Link>
    </div>
  );
}
