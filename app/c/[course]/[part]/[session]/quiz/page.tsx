import QuizQuestion from "@/components/QuizQuestion";
import { FileType } from "@/data/schema";
import { ErrorBoundary } from "react-error-boundary";
import { SessionPageProps, getAllChapterAttachments, getPieceWithChildrenOrNotFound } from "../common";
import { FileReference } from "@/lib/data/data-backend";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapterAttachments = await getAllChapterAttachments(piece, FileType.quiz);
  const allQuestions = chapterAttachments.flatMap(({ attachments: questions, chapter }) =>
    questions.map((quiz) => ({ chapter, quiz }))
  );
  return (
    <div className="w-full flex flex-col gap-4">
      {allQuestions.map(async ({ chapter, quiz }, index) => (
        <ErrorBoundary key={quiz.hash} fallback={<QuestionError quiz={quiz} />}>
          <QuizQuestion index={index + 1} chapter={chapter} quiz={quiz} />
        </ErrorBoundary>
      ))}
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