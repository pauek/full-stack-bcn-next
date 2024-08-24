import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { notFound } from "next/navigation"
import Navigator from "@/components/Navigator"
import { Header } from "./header"
import { attachmentsMenuOptions, splitIdpath } from "./utils"

interface Props {
  children: React.ReactNode
  params: {
    path: string[]
  }
}

export default async function Layout({ children, params }: Props) {
  const { idpath } = splitIdpath(params.path)
  let piece: ContentPiece | null = await data.getPiece(idpath)
  if (!piece) {
    notFound()
  }
  let parent: ContentPiece | null = null
  let siblings: ContentPiece[] | null = null
  let index: number = -1

  if (idpath.length > 1) {
    const parentIdpath = idpath.slice(0, -1)
    parent = await data.getPieceWithChildren(parentIdpath)
    siblings = parent?.children ?? null
    if (siblings) {
      index = siblings.findIndex((p) => p.idpath.join("/") === idpath.join("/"))
      piece = siblings[index]
    }
  }

  const attachments = await attachmentsMenuOptions(piece)

  return (
    <main id="top" className="flex-1 w-full h-full flex flex-col bg-secondary">
      <Navigator pieceList={siblings} parent={parent} index={index} />
      <Header piece={piece} attachments={attachments} />
      <div className="flex-1 max-w-[54em] w-full mx-auto flex flex-col">{children}</div>
    </main>
  )
}
