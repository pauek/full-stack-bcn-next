import Exercise from "@/components/Exercise"
import SlideGrid from "@/components/SlideGrid"
import { FileType } from "@/data/schema"
import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import { fileUrl } from "@/lib/urls"
import { ChapterPageProps, getChapterAttachments, getChapterOrNotFound } from "./utils"
import CollapsibleSection from "@/components/Collapsible"
import SlideShow from "@/components/icons/SlideShow"
import { ExerciseIcon } from "@/components/icons/ExerciseIcon"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ErrorBoundary } from "react-error-boundary"
import { FileBuffer, FileReference } from "@/lib/data/data-backend"
import QuizQuestion from "@/components/QuizQuestion"
import FullScreen from "@/components/FullScreen"
import { QuizIcon } from "@/components/icons/QuizIcon"
import { getSessionOrNotFound } from "../utils"
import MdxDocument from "@/components/mdx/MdxDocument"
import { splitMarkdownPreamble } from "@/lib/utils"

export async function generateMetadata({ params }: ChapterPageProps) {
  const session = await getSessionOrNotFound({ params })
  const chapter = await getChapterOrNotFound({ params })
  return {
    title: `${chapter.name} - ${session.name} - Full-stack Web Technologies`,
  }
}

export default async function Page({ params }: ChapterPageProps) {
  const chapter = await getChapterOrNotFound({ params })
  const document = await data.getPieceDocument(chapter)

  const slides = await getChapterAttachments(chapter, FileType.slide)
  const exercises = await getChapterAttachments(chapter, FileType.exercise)
  const questions = await getChapterAttachments(chapter, FileType.quiz)

  const Slides = () =>
    slides.length > 0 && (
      <CollapsibleSection
        title="SLIDES"
        className="border bg-zinc-200 dark:bg-zinc-900"
        icon={<SlideShow size={14} />}
      >
        <SlideGrid slides={slides.map(fileUrl)} />
      </CollapsibleSection>
    )

  const Document = async ({ document }: { document: FileBuffer }) => {
    const images = await data.getPieceAttachmentList(chapter, FileType.image)
    const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]))
    const { body } = splitMarkdownPreamble(document.buffer.toString())
    return (
      <div className="flex flex-col justify-start">
        <div className="bg-card rounded relative">
          <div className="mx-5 py-5">
            <MdxDocument
              text={body}
              imageMap={chapterImageMap}
              className="bg-card rounded relative"
            />
          </div>
        </div>
      </div>
    )
  }

  const Exercises = () =>
    exercises.length > 0 && (
      <CollapsibleSection
        title="EXERCISES"
        className="border bg-stone-50 dark:bg-stone-900"
        icon={<ExerciseIcon />}
      >
        {exercises.map(async (exercise, index) => (
          <Exercise key={exercise.hash} index={index + 1} chapter={chapter} exercise={exercise} />
        ))}
      </CollapsibleSection>
    )

  const Quiz = () =>
    questions.length > 0 && (
      <FullScreen title="Take quiz" icon={<QuizIcon className="text-xl" />}>
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
                    <QuizQuestion index={index + 1} chapter={chapter} quiz={quiz} />
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
      </FullScreen>
    )

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Quiz />
      <Slides />
      {document && <Document document={document} />}
      <Exercises />
    </div>
  )
}

const QuestionError = ({ quiz }: { quiz: FileReference }) => {
  return (
    <div className="m-2.5 p-2.5 bg-red-600 text-foreground rounded font-mono text-sm px-4 text-white">
      Error rendering question &quot;
      <span className="text-yellow-400 font-bold">{quiz.filename}</span>&quot;{" "}
      <div className="text-gray-900">{quiz.hash}</div>
    </div>
  )
}

// export const generateStaticParams = async () => {
//   const course = await data.getPiece([env.COURSE_ID])
//   if (!course) {
//     return []
//   }
//   return (await data.getAllIdpaths(course.idpath))
//     .filter((path) => path.length === 4)
//     .map(([course, part, session, chapter]) => ({ course, part, session, chapter }))
// }
