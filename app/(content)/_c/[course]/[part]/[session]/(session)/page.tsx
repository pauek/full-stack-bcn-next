import { ContentPiece, hash } from "@/lib/adt"
import data from "@/lib/data"
import { pieceUrlPath } from "@/lib/urls"
import { Metadata } from "next"
import Link from "next/link"
import { SessionPageProps, _generateStaticParams, getPieceWithChildrenOrNotFound } from "../utils"

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
    const { course, part, session } = await params
    const piece = await data.getPiece([course, part, session])
    const partPiece = await data.getPiece([course, part])
    if (!piece) {
        return { title: "Not Found" }
    }
    if (partPiece) {
        return { title: `${piece.name} - ${partPiece.name}` }
    }
    return { title: piece.name }
}

export default async function Page({ params }: SessionPageProps) {
    const piece = await getPieceWithChildrenOrNotFound({ params })
    const chapters = (piece.children || []).filter((ch) => !ch.metadata.hidden)

    const ChapterCard = ({ chapter }: { chapter: ContentPiece }) => (
        <Link
            href={pieceUrlPath(chapter.idpath)}
            className="bg-card p-2 px-3 rounded flex flex-col"
        >
            <span className="text-[.65em] opacity-50 mr-3">CHAPTER {chapter.metadata.index}</span>
            <h4 className="m-0 leading-5">{chapter.name}</h4>
        </Link>
    )

    return (
        <div className="w-full max-w-[54rem] flex flex-col gap-2 mx-auto pt-2">
            {chapters.map((chapter) => (
                <ChapterCard key={hash(chapter)} chapter={chapter} />
            ))}
        </div>
    )
}

// export const generateStaticParams = _generateStaticParams
