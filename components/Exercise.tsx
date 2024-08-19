import MdxDocument from "@/components/mdx/MdxDocument"
import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { FileReference } from "@/lib/data/data-backend"
import { cn, splitMarkdownPreamble } from "@/lib/utils"

type ExerciseProps = {
  chapter: ContentPiece
  exercise: FileReference
  index: number
}
export default async function Exercise({ index, chapter, exercise }: ExerciseProps) {
  const content = await data.getAttachmentContent(chapter, exercise)
  const images = await data.getPieceAttachmentList(chapter, FileType.image)
  const imageMap = new Map(images.map((ref) => [ref.filename, ref]))

  if (content === null) {
    return null
  }
  const { preamble, body } = splitMarkdownPreamble(content?.bytes.toString())
  return (
    <>
      <pre className="text-xs bg-red-100 border-none text-black">{JSON.stringify(content.metadata, null, 2)}</pre>

      <div className="md:flex md:flex-row flex-col mx-2.5 mb-2.5">
        <div
          className={cn(
            "mx-2.5 lg:ml-5 mt-[.7em] w-[1.8em] h-[1.8em]",
            "flex flex-col justify-center items-center",
            "bg-primary text-background font-bold rounded-full"
          )}
        >
          {index}
        </div>
        <div className="flex-1">
          <MdxDocument className="p-2.5" text={body} imageMap={imageMap} />
        </div>
      </div>
    </>
  )
}
