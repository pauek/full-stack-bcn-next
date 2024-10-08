import { ContentPiece } from "@/lib/adt"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"

interface Props {
  chapter: ContentPiece
}
export default async function ChapterCard({ chapter }: Props) {
  return (
    <Link href={pieceUrlPath(chapter.idpath)}>
      <div className="bg-card p-1.5 pt-2.5 px-3 rounded border hover:border-black leading-3">
        <span className="text-[.65em] text-gray-400">CHAPTER {chapter.metadata.index}</span>
        <h4 className="m-0">{chapter.name}</h4>
      </div>
    </Link>
  )
}
