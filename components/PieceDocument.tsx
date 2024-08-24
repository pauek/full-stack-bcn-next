import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { FileBuffer } from "@/lib/data/data-backend"
import { splitMarkdownPreamble } from "@/lib/utils"
import MdxDocument from "./mdx/MdxDocument"

type ChapterProps = {
  piece: ContentPiece
}
export default async function PieceDocument({ piece }: ChapterProps) {
  const doc = await data.getPieceDocument(piece)
  const images = await data.getPieceAttachmentList(piece, FileType.image)
  const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]))

  const Document = ({ doc }: { doc: FileBuffer }) => {
    const { body } = splitMarkdownPreamble(doc.buffer.toString())
    return (
      <div className="mx-5 py-5">
        <MdxDocument
          text={body}
          imageMap={chapterImageMap}
          className="bg-card rounded relative"
        />
      </div>
    )
  }


  return (
    <div key={piece.hash} className="bg-card rounded relative">
      {doc ? <Document doc={doc} /> : <p>No document.</p>}
    </div>
  )
}
