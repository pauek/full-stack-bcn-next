import ChapterCard from "@/components/cards/ChapterCard"
import PartCard from "@/components/cards/PartCard"
import SessionCard from "@/components/cards/SessionCard"
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
import MdxDocument from "@/components/mdx/MdxDocument"
import { FileBuffer, FileReference } from "@/lib/data/data-backend"
import { splitMarkdownPreamble } from "@/lib/utils"
import { env } from "@/lib/env.mjs"

/// Pages

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

async function PartPage({ piece: { children } }: { piece: ContentPiece }) {
  return (
    <div className="flex-1 mt-4">
      <div className="flex flex-wrap justify-center gap-2 bg-background py-3">
        {children &&
          children.map((session) => (
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
  const document = await data.getPieceDocument(piece)
  const slides = await data.getPieceAttachmentList(piece, FileType.slide)
  const exercises = await data.getPieceAttachmentList(piece, FileType.exercise)
  const questions = await data.getPieceAttachmentList(piece, FileType.quiz)

  return (
    <div className="flex-1">
      <Tabs defaultValue="document" className="relative mt-4">
        <TabsList className="absolute right-0 -top-16">
          {document !== null && <TabsTrigger value="document">Document</TabsTrigger>}
          {exercises.length > 0 && <TabsTrigger value="exercises">Exercises</TabsTrigger>}
          {slides.length > 0 && <TabsTrigger value="slides">Slides</TabsTrigger>}
          {questions.length > 0 && <TabsTrigger value="quiz">Quiz</TabsTrigger>}
        </TabsList>
        {document !== null && (
          <TabsContent value="document">
            <DocumentContent piece={piece} document={document} />
          </TabsContent>
        )}
        {exercises.length > 0 && (
          <TabsContent value="exercises">
            <ExerciseContent piece={piece} exercises={exercises} />
          </TabsContent>
        )}
        {slides.length > 0 && (
          <TabsContent value="slides">
            <SlidesContent slides={slides} />
          </TabsContent>
        )}
        {questions.length > 0 && (
          <TabsContent value="quiz">
            <QuizContent piece={piece} questions={questions} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

/// Attachment bodies

type DocumentContentProps = {
  piece: ContentPiece
  document: FileBuffer
}
const DocumentContent = async ({ piece, document }: DocumentContentProps) => {
  const images = await data.getPieceAttachmentList(piece, FileType.image)
  const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]))
  const { body } = splitMarkdownPreamble(document.buffer.toString())
  return (
    <div key={piece.hash} className="bg-card rounded relative">
      <div className="mx-5 py-5">
        <MdxDocument text={body} imageMap={chapterImageMap} className="bg-card rounded relative" />
      </div>
    </div>
  )
}

type ContentProps = {
  piece: ContentPiece
  exercises: FileReference[]
}
const ExerciseContent = async ({ piece, exercises }: ContentProps) => (
  <div className="flex flex-col gap-4">
    {exercises.map(async (exercise, index) => (
      <Exercise key={exercise.hash} index={index + 1} chapter={piece} exercise={exercise} />
    ))}
  </div>
)

type SlidesContentProps = {
  slides: FileReference[]
}
const SlidesContent = async ({ slides }: SlidesContentProps) => (
  <div className="bg-background p-4 rounded">
    <SlideGrid slides={slides.map(attachmentUrl)} />
  </div>
)

type QuizContentProps = {
  piece: ContentPiece
  questions: FileReference[]
}
const QuizContent = async ({ piece, questions }: QuizContentProps) => {
  return (
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
  )
}

/// Dispatchers

const attachmentPage = async (piece: ContentPiece, attachment: string) => {
  switch (attachment) {
    case ".doc": {
      const document = await data.getPieceDocument(piece)
      if (document === null) {
        notFound()
      }
      return (
        <main className="mt-4">
          <DocumentContent piece={piece} document={document} />
        </main>
      )
    }
    case ".exercises": {
      const exercises = await data.getPieceAttachmentList(piece, FileType.exercise)
      if (exercises.length === 0) {
        notFound()
      }
      return (
        <main className="mt-4">
          <ExerciseContent piece={piece} exercises={exercises} />
        </main>
      )
    }
    case ".slides": {
      const slides = await data.getPieceAttachmentList(piece, FileType.slide)
      if (slides.length === 0) {
        notFound()
      }
      return (
        <main className="mt-4">
          <SlidesContent slides={slides} />
        </main>
      )
    }
    case ".quiz": {
      const questions = await data.getPieceAttachmentList(piece, FileType.quiz)
      if (questions.length === 0) {
        notFound()
      }
      return (
        <main className="mt-4">
          <QuizContent piece={piece} questions={questions} />
        </main>
      )
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

export const generateStaticParams = async () => {
  const course = await data.getPiece([env.COURSE_ID])
  if (!course) {
    return []
  }
  const idpaths = await data.getAllIdpaths(course.idpath)
  const params: { path: string[] }[] = []
  for (const idpath of idpaths) {
    const piece = await data.getPiece(idpath)
    if (piece === null) {
      console.warn(`WARNING: getAllIdpaths returns "${idpath.join("/")}" which is not from a piece`)
      continue
    }
    if (piece.metadata.hidden) {
      console.log(`Skipping hidden piece: ${piece.idpath.join("/")}`)
      continue
    }
    params.push({ path: piece.idpath })

    if (await data.pieceHasDoc(piece)) {
      params.push({ path: [...piece.idpath, ".doc"] })
    }
    const slides = await data.getPieceAttachmentList(piece, FileType.slide)
    if (slides.length > 0) {
      params.push({ path: [...piece.idpath, ".slides"] })
    }
    const exercises = await data.getPieceAttachmentList(piece, FileType.exercise)
    if (exercises.length > 0) {
      params.push({ path: [...piece.idpath, ".exercises"] })
    }
    const questions = await data.getPieceAttachmentList(piece, FileType.quiz)
    if (questions.length > 0) {
      params.push({ path: [...piece.idpath, ".quiz"] })
    }
  }

  return params
}
