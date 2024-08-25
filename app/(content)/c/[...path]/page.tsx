import ChapterCard from "@/components/cards/ChapterCard"
import PartCard from "@/components/cards/PartCard"
import SessionCard from "@/components/cards/SessionCard"
import PieceDocument from "@/components/PieceDocument"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { attachmentUrl, pieceUrlPath } from "@/lib/urls"
import { TabsContent } from "@radix-ui/react-tabs"
import Link from "next/link"
import { notFound } from "next/navigation"
import { splitIdpath } from "./utils"
import Exercise from "@/components/Exercise"
import SlideGrid from "@/components/SlideGrid"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ErrorBoundary } from "react-error-boundary"
import QuizQuestion from "@/components/QuizQuestion"
import { QuestionError } from "@/components/QuestionError"

async function DefaultPage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      {piece.children &&
        piece.children.map((childPiece) => (
          <Link key={childPiece.idpath.join("/")} href={pieceUrlPath(childPiece.idpath)}>
            {childPiece.name}
          </Link>
        ))}
    </div>
  )
}

async function CoursePage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="mt-4 flex-1 flex flex-col gap-5">
      {piece?.children &&
        piece.children.map((childPiece) => (
          <PartCard key={childPiece.idpath.join("/")} piece={childPiece} />
        ))}
    </div>
  )
}

async function PartPage({ piece }: { piece: ContentPiece }) {
  return (
    <div className="flex-1 mt-4">
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

async function ChapterPage({ piece }: { piece: ContentPiece }) {
  const document = await data.getPieceAttachmentList(piece, FileType.doc)
  const slides = await data.getPieceAttachmentList(piece, FileType.slide)
  const exercises = await data.getPieceAttachmentList(piece, FileType.exercise)
  const questions = await data.getPieceAttachmentList(piece, FileType.quiz)

  return (
    <div className="flex-1">
      <Tabs defaultValue="document" className="relative mt-4">
        <TabsList className="absolute right-0 -top-16">
          {document.length > 0 && <TabsTrigger value="document">Document</TabsTrigger>}
          {exercises.length > 0 && <TabsTrigger value="exercises">Exercises</TabsTrigger>}
          {slides.length > 0 && <TabsTrigger value="slides">Slides</TabsTrigger>}
          {questions.length > 0 && <TabsTrigger value="quiz">Quiz</TabsTrigger>}
        </TabsList>
        <TabsContent value="document">
          <PieceDocument piece={piece} />
        </TabsContent>
        <TabsContent value="exercises">
          <div className="flex flex-col gap-4">
            {exercises.map(async (exercise, index) => (
              <Exercise key={exercise.hash} index={index + 1} chapter={piece} exercise={exercise} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="slides">
          <div className="bg-background p-4 rounded">
            <SlideGrid slides={slides.map(attachmentUrl)} />
          </div>
        </TabsContent>
        <TabsContent value="quiz">
          <div className="w-full h-full flex flex-row justify-center">
            <Carousel
              className="w-full h-full flex flex-col justify-center max-w-[38em] pt-[1em]"
              orientation="horizontal"
              opts={{ loop: true, duration: 15 }}
            >
              <CarouselContent>
                {questions.map(async (quiz, index) => (
                  <CarouselItem key={quiz.hash} className="h-full flex flex-col justify-center">
                    <ErrorBoundary fallback={<QuestionError quiz={quiz} />}>
                      <QuizQuestion index={index + 1} chapter={piece} quiz={quiz} />
                    </ErrorBoundary>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function DocumentPage({ piece }: { piece: ContentPiece }) {
  return (
    <main className="mt-4">
      <PieceDocument piece={piece} />
    </main>
  )
}

const attachmentPage = (piece: ContentPiece, attachment: string) => {
  switch (attachment) {
    case ".doc": {
      return <DocumentPage piece={piece} />
    }
    default: {
      throw new Error(`Unknown attachment type: ${attachment}`)
    }
  }
}

const piecePage = async (piece: ContentPiece) => {
  switch (piece.idpath.length) {
    case 1: {
      return <CoursePage piece={piece} />
    }
    case 2: {
      return <PartPage piece={piece} />
    }
    case 3: {
      return <SessionPage piece={piece} />
    }
    case 4: {
      return <ChapterPage piece={piece} />
    }
    default: {
      return <DefaultPage piece={piece} />
    }
  }
}

interface Props {
  params: {
    path: string[]
  }
}
export default async function Page({ params }: Props) {
  const { idpath, attachment } = splitIdpath(params.path)
  const piece = await data.getPieceWithChildren(idpath)
  if (!piece) {
    return notFound()
  }
  if (attachment) {
    return attachmentPage(piece, attachment)
  } else {
    return piecePage(piece)
  }
}
