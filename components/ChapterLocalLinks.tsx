import { ContentPiece } from "@/lib/adt"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"

type Props = {
  session: ContentPiece
  chapters: ContentPiece[]
}
export default function ChapterLocalLinks({ session, chapters }: Props) {
  return (
    <div className="hidden sticky z-10 top-[3rem] right-0 p-3 pr-8 md:flex md:flex-row justify-end">
      <div className="flex flex-col gap-2">
        {/* <Link href="#top">{session.name}</Link> */}
        {chapters.map(
          (chapter) =>
            chapter.metadata.hidden || (
              <Link
                key={chapter.hash}
                href={pieceUrlPath(chapter.idpath)}
                className="text-sm opacity-60"
              >
                {chapter.metadata.index}. {chapter.name.toUpperCase()}
              </Link>
            ),
        )}
      </div>
    </div>
  )
}
