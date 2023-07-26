import { Chapter, getChapter } from "@/lib/content-server";
import Link from "next/link";
import SlideShow from "./icons/SlideShow";
import BookIcon from "./icons/BookIcon";

type ChapterCardProps = {
  path: string[];
  chapter: Chapter;
};
export default async function ChapterCard({ path, chapter }: ChapterCardProps) {
  const _chap = await getChapter([...path, chapter.id]);
  const chapterUrl = `/content/${path!.join("/")}/${chapter.id}`;
  return (
    <Link href={chapterUrl}>
      <div className="border rounded shadow-sm bg-white hover:border-stone-400 flex flex-col">
        <div className="font-bold p-3 pl-4 pb-2">{chapter.name}</div>
        <div className="border-b"></div>
        <div className="flex flex-row text-stone-400 text-sm">
          {_chap.hasDoc && (
            <div className="px-2 py-1">
              <BookIcon size={20} />
            </div>
          )}
          <div className="border-l"></div>
          {_chap.numSlides > 0 && (
            <div className="px-2 py-1 flex flex-row items-center">
              <SlideShow size={18} className="mr-1" />
              {_chap.numSlides}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
