import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { attachmentUrl, pieceUrlPath } from "@/lib/urls"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface Props {
  session: ContentPiece
}
export default async function SessionCard({ session }: Props) {
  const [cover] = await data.getPieceAttachmentList(session, FileType.cover)
  const { idpath, name, metadata } = session
  const { index } = metadata

  const isDevMode = process.env.NODE_ENV === "development"
  const numSlides = session.children?.reduce((a, b) => a + b.metadata.numSlides, 0)

  return (
    <Link href={pieceUrlPath(idpath, `c2`)} className="w-1/4 aspect-[7/6]">
      <div
        className={cn(
          "h-full text-xs sm:text-sm",
          "flex flex-col relative items-stretch",
          "hover:border-foreground",
          "bg-muted border rounded-md shadow shadow-foreground-50 m-1 overflow-clip"
        )}
      >
        <div className="flex-1 relative">
          {cover && (
            <Image
              className="object-cover dark:invert"
              src={attachmentUrl(cover)}
              alt="card cover"
              fill={true}
            />
          )}
        </div>

        <div className="px-2 pb-1 pt-1.5 bg-card border-t border-secondary whitespace-nowrap">
          <div className="font-semibold overflow-hidden text-ellipsis text-center">{name}</div>
          {isDevMode && (
            <div className="text-center text-xs text-gray-500">
              {session.children?.length || 0} chapters | {numSlides} slides
            </div>
          )}
        </div>

        <div
          className={cn(
            "w-[1.8em] h-[1.8em] absolute flex flex-col justify-center font-bold",
            "items-center top-0.5 left-0.5 text-xs rounded-sm bg-card border"
          )}
        >
          {index}
        </div>
      </div>
    </Link>
  )
}
