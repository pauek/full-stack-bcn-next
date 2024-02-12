import ChapterHeader from "@/components/ChapterHeader";
import Exercise from "@/components/Exercise";
import { SessionPageProps, getAttachments, getPieceWithChildrenOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const attachments = await getAttachments(piece, "exercise");

  return (
    <div className="w-full flex flex-col gap-4">
      {attachments.map(
        ({ chapter, attachments: exercises }, index) =>
          exercises.length > 0 && (
            <div key={chapter.hash} className="bg-card rounded min-h-[6em]">
              <ChapterHeader index={index + 1} />
              {exercises.map(async (exercise, index) => (
                <Exercise
                  key={exercise.hash}
                  index={index + 1}
                  chapter={chapter}
                  exercise={exercise}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
}

export const generateStaticParams = generateStaticParamsCommon("exercises");