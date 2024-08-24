import data from "@/lib/data"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: {
    idpath: string[]
  }
}

async function DefaultPage({ idpath }: { idpath: string[] }) {
  const piece = await data.getPieceWithChildren(idpath)
  return (
    <div className="flex-1 flex flex-col gap-2">
      {piece?.children &&
        piece.children.map((childPiece) => (
          <Link key={childPiece.idpath.join("/")} href={pieceUrlPath(childPiece.idpath, `c2`)}>
            {childPiece.name}
          </Link>
        ))}
    </div>
  )
}

export default async function Page({ params: { idpath } }: Props) {
  switch (idpath.length) {
    default: {
      return <DefaultPage idpath={idpath} />
    }
  }
}
