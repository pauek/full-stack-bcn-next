import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import MdxDocument from "./mdx/MdxDocument"

type ChapterProps = {
  chapter: ContentPiece
}
export default async function Chapter({ chapter }: ChapterProps) {
  const doc = await data.getPieceDocument(chapter)
  const images = await data.getPieceAttachmentList(chapter, FileType.image)
  const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]))
  return (
    <div key={chapter.hash} className="bg-card rounded relative">
      {/* <ChapterHeader chapter={chapter} /> */}
      {doc && (
        <div className="mx-5 py-5">
          <MdxDocument
            text={doc.buffer.toString()}
            imageMap={chapterImageMap}
            className="bg-card rounded relative"
          />
        </div>
      )}
    </div>
  )
}
