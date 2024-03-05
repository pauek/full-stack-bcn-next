import QuizQuestion from "@/components/QuizQuestion";
import { FileType } from "@/data/schema";
import { ErrorBoundary } from "react-error-boundary";
import {
  SessionPageProps,
  getAllChapterAttachments,
  getPieceWithChildrenOrNotFound,
} from "../common";
import { FileReference } from "@/lib/data/data-backend";
import { generateStaticParamsCommon } from "../static-params";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapterAttachments = await getAllChapterAttachments(piece, FileType.quiz);
  const allQuestions = chapterAttachments.flatMap(({ attachments: questions, chapter }) =>
    questions.map((quiz) => ({ chapter, quiz }))
  );
  return (
    <div className="w-full flex flex-row justify-center">
      <Carousel className="w-full max-w-[38em] max-h-[20em] pt-[1em]" orientation="horizontal" opts={{ loop: true, duration: 15 }}>
        <CarouselContent>
          {allQuestions.map(async ({ chapter, quiz }, index) => (
            <CarouselItem key={quiz.hash} className="h-full">
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
  );
}

const QuestionError = ({ quiz }: { quiz: FileReference }) => {
  return (
    <div className="m-2.5 p-2.5 bg-red-600 text-foreground rounded font-mono text-sm px-4 text-white">
      Error rendering question &quot;
      <span className="text-yellow-400 font-bold">{quiz.filename}</span>&quot;{" "}
      <div className="text-gray-900">{quiz.hash}</div>
    </div>
  );
};

export const generateStaticParams = generateStaticParamsCommon;
