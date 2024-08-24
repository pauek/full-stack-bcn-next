import { ContentPiece } from "@/lib/adt"
import { pieceUrlPath } from "@/lib/urls"
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import Link from "next/link"

interface Props {
  parent: ContentPiece | null
  pieceList: ContentPiece[] | null
  index: number
  prefix?: string
}

export default function Navigator({ index, pieceList, parent, prefix = "c" }: Props) {
  return (
    <div className="h-14 border-b p-1 px-3 text-xs text-stone-400 dark:text-stone-600 w-full flex flex-row items-stretch bg-background">
      <div className="flex flex-row w-full max-w-[54rem] mx-auto">
        {pieceList && index > 0 ? (
          <Link
            href={pieceUrlPath(pieceList[index - 1].idpath, prefix)}
            className="flex-1 flex flex-col justify-end"
          >
            <ArrowLeftIcon />
            <div className="line-clamp-1">{pieceList[index - 1].name}</div>
          </Link>
        ) : (
          <div className="flex-1"></div>
        )}
        {parent && (
          <Link
            href={pieceUrlPath(parent.idpath, prefix)}
            className="flex-1 flex flex-col justify-end items-center "
          >
            <ArrowUpIcon />
            <div className="line-clamp-1">{parent.name}</div>
          </Link>
        )}
        {pieceList && index < pieceList.length - 1 ? (
          <Link
            href={pieceUrlPath(pieceList[index + 1].idpath, prefix)}
            className="flex-1 text-right flex flex-col justify-end items-end"
          >
            <ArrowRightIcon />
            <div className="line-clamp-1">{pieceList[index + 1].name}</div>
          </Link>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
    </div>
  )
}
