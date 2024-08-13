import { ContentPiece } from "@/lib/adt"

type ChapterHeaderProps = {
  chapter: ContentPiece
}
export default function ChapterHeader({ chapter }: ChapterHeaderProps) {
  const {
    name,
    metadata: { index },
  } = chapter
  return (
    <h2 className="mx-5 text-2xl font-bold pt-4 pb-2 mb-2 border-b">
      <div className="text-xs font-light pl-0.5">CHAPTER {index}</div>
      {name}
    </h2>
  )
}
