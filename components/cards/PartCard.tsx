import { ContentPiece } from "@/lib/adt"
import { pieceUrlPath } from "@/lib/urls"
import Link from "next/link"
import data from "@/lib/data"
import SessionCard from "./SessionCard"

export default async function PartCard({ piece }: { piece: ContentPiece }) {
  const part = await data.getPieceWithChildren(piece.idpath)
  if (!part) {
    console.error(`Part not found: ${piece.idpath.join("/")}`)
    return null
  }
  const { children } = part
  return (
    <Link href={pieceUrlPath(piece.idpath, `c2`)}>
      <div className="group p-3 px-4 bg-card shadow rounded border hover:border-foreground">
        <h4 className="text-center text-gray-400">{piece.name.toUpperCase()}</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {children &&
            children.map((session) => (
              <SessionCard key={session.idpath.join("/")} session={session} />
            ))}
        </div>
      </div>
    </Link>
  )
}
