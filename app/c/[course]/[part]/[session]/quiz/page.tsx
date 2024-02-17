import { FileType } from "@/data/schema";
import { SessionPageProps, getAttachments, getPieceWithChildrenOrNotFound } from "../common";
import ChapterHeader from "@/components/ChapterHeader";
import QuizQuestion from "@/components/QuizQuestion";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const chapterAttachments = await getAttachments(piece, FileType.quiz);
  return (
    <div className="w-full flex flex-col gap-4">
      {chapterAttachments.map(
        ({ chapter, attachments: questions }, index) =>
          questions.length > 0 && (
            <div key={chapter.hash} className="bg-card rounded min-h-[6em]">
              <ChapterHeader index={index + 1} name={chapter.name} />
              {questions.map(async (quiz, index) => (
                <QuizQuestion
                  key={quiz.hash}
                  index={index + 1}
                  chapter={chapter}
                  quiz={quiz}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
}
