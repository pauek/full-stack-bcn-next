import ChapterHeader from "@/components/ChapterHeader";
import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { cn } from "@/lib/utils";
import { SessionPageProps, getAttachments, getPieceWithChildrenOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

type ExerciseProps = {
  chapter: ContentPiece;
  exercise: FileReference;
  index: number;
};
const Exercise = async ({ index, chapter, exercise }: ExerciseProps) => {
  const text = await data.getAttachmentBytes(chapter, exercise);

  return (
    text && (
      <div className="md:flex md:flex-row flex-col">
        <div
          className={cn(
            "mx-2.5 lg:ml-5 mt-[.7em] w-[1.8em] h-[1.8em]",
            "flex flex-col justify-center items-center",
            "bg-primary text-background font-bold rounded-full"
          )}
        >
          {index}
        </div>
        <div className="flex-1">
          <MdxDocument className="p-2.5" text={text?.toString()} imageMap={new Map()} />
        </div>
      </div>
    )
  );
};

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const attachments = await getAttachments(piece, "exercise");

  return (
    <div className="w-full flex flex-col gap-4">
      {attachments.map(
        ({ chapter, attachments: exercises }, index) =>
          exercises.length > 0 && (
            <div key={chapter.hash} className="bg-card rounded min-h-[6em]">
              <ChapterHeader index={index + 1} name={chapter.name} />
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
