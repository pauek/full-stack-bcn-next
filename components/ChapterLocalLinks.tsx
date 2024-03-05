import { ContentPiece } from "@/lib/adt";
import Link from "next/link";

type Props = {
  piece: ContentPiece;
  chapters: ContentPiece[];
};
export default function ChapterLocalLinks({ piece, chapters }: Props) {
  return (
    <div className="hidden absolute sticky z-10 top-[3rem] right-0 p-3 pr-8 md:flex md:flex-row justify-end">
      <div className="flex flex-col gap-2">
        <Link href="#top">{piece.name}</Link>
        {chapters.map(
          (chapter, index) =>
            chapter.metadata.hidden || (
              <Link key={chapter.hash} href={`#${chapter.id}`} className="text-sm opacity-60">
                {index + 1}. {chapter.name.toUpperCase()}
              </Link>
            )
        )}
      </div>
    </div>
  );
}
