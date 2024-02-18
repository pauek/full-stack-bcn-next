import QuizQuestion from "@/components/QuizQuestion";
import { FileType } from "@/data/schema";
import { ErrorBoundary } from "react-error-boundary";
import { SessionPageProps, getAttachments, getPieceWithChildrenOrNotFound } from "../common";
import { FileReference } from "@/lib/data/data-backend";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapterAttachments = await getAttachments(piece, FileType.quiz);
  return (
    <div className="w-full flex flex-col gap-4">
      {chapterAttachments.map(
        ({ chapter, attachments: questions }) =>
          questions.length > 0 && (
            <div key={chapter.hash}>
              {questions.map(async (quiz, index) => (
                <ErrorBoundary key={quiz.hash} fallback={<QuestionError quiz={quiz} />}>
                  <QuizQuestion index={index + 1} chapter={chapter} quiz={quiz} />
                </ErrorBoundary>
              ))}
            </div>
          )
      )}
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
