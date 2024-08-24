import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"
import { notFound } from "next/navigation"
import PartCard from "@/components/cards/PartCard"
import SessionCard from "@/components/cards/SessionCard"
import ChapterCard from "@/components/cards/ChapterCard"

async function DefaultPage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      {piece.children &&
        piece.children.map((childPiece) => (
          <Link key={childPiece.idpath.join("/")} href={pieceUrlPath(childPiece.idpath, `c2`)}>
            {childPiece.name}
          </Link>
        ))}
    </div>
  )
}

async function CoursePage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1 flex flex-col gap-5">
      {piece?.children &&
        piece.children.map((childPiece) => (
          <PartCard key={childPiece.idpath.join("/")} piece={childPiece} />
        ))}
    </div>
  )
}

async function PartPage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1">
      <div className="flex flex-wrap justify-center gap-2 bg-background py-3">
        {piece?.children &&
          piece.children.map((session) => (
            <SessionCard key={session.idpath.join("/")} session={session} />
          ))}
      </div>
    </div>
  )
}

async function SessionPage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1">
      <div className="flex flex-col gap-1.5 py-3">
        {piece?.children &&
          piece.children.map((chapter) => (
            <ChapterCard key={chapter.idpath.join("/")} chapter={chapter} />
          ))}
      </div>
    </div>
  )
}

interface Props {
  params: {
    idpath: string[]
  }
}
export default async function Page({ params: { idpath } }: Props) {
  const piece = await data.getPieceWithChildren(idpath)
  if (!piece) {
    return notFound()
  }
  switch (idpath.length) {
    case 1: {
      return <CoursePage piece={piece} />
    }
    case 2: {
      return <PartPage piece={piece} />
    }
    case 3: {
      return <SessionPage piece={piece} />
    }
    default: {
      return <DefaultPage piece={piece} />
    }
  }
}
