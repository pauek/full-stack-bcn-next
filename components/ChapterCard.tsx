import { getChapter } from "@/lib/files/files";
import { Chapter } from "@/lib/adt";
import Link from "next/link";
import BookIcon from "./icons/BookIcon";
import SlideShow from "./icons/SlideShow";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

type ChapterCardProps = {
	path: string[];
	chapter: Chapter;
};
export default async function ChapterCard({ path, chapter }: ChapterCardProps) {
	const chapterUrl = `/content/${path!.join("/")}/${chapter.id}`;
	return (
		<Link href={chapterUrl}>
			<Card>
				<CardHeader className="p-5">
					<CardTitle>{chapter.name}</CardTitle>
					<CardDescription>
						<div className="flex flex-row items-center text-stone-400 min-h-[20px]">
							{chapter.hasDoc && <BookIcon size={18} />}
							<div className="border-l mr-3"></div>
							{chapter.numSlides > 0 && (
								<>
									<SlideShow size={16} className="mr-1" />
									{chapter.numSlides}
								</>
							)}
						</div>
					</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);

	/*

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


  */
}
