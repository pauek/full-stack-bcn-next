import { Chapter } from "@/lib/adt";
import Link from "next/link";
import BookIcon from "./icons/BookIcon";
import SlideShow from "./icons/SlideShow";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { pieceNumSlides, pieceHasDoc } from "@/lib/files/files";

type ChapterCardProps = {
  path: string[];
  chapter: Chapter;
};
export default async function ChapterCard({ path, chapter }: ChapterCardProps) {
  const chapterUrl = `/content/${path!.join("/")}/${chapter.id}`;
  const hasDoc = await pieceHasDoc(chapter);
  const numSlides = await pieceNumSlides(chapter);
  return (
    <Link href={chapterUrl}>
      <Card>
        <CardHeader className="p-5">
          <CardTitle>{chapter.name}</CardTitle>
          <CardDescription>
            <div className="flex flex-row items-center text-stone-400 min-h-[20px]">
              {hasDoc && <BookIcon size={18} />}
              <div className="border-l mr-3"></div>
              {numSlides > 0 && (
                <>
                  <SlideShow size={16} className="mr-1" />
                  {numSlides}
                </>
              )}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
