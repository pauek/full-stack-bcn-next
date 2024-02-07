import ChapterDocument from "@/components/ChapterDocument";
import { SessionPageProps, getAttachments, getPieceOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";
import ChapterHeader from "@/components/ChapterHeader";
import MdxDocument from "@/components/MdxDocument";
import data from "@/lib/data";
import { ContentPiece } from "@/lib/adt";
import { FileReference } from "@/lib/data/data-backend";
import { cn } from "@/lib/utils";

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
            "ml-5 mt-[.7em] w-[1.8em] h-[1.8em]",
            "flex flex-col justify-center items-center",
            "bg-primary text-background font-bold rounded-full"
          )}
        >
          {index}
        </div>
        <div className="flex-1">
          <MdxDocument text={text?.toString()} imageMap={new Map()} />
        </div>
      </div>
    )
  );
};

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceOrNotFound({ params });
  const exercises = await getAttachments(piece, "exercise");
  return (
    <div className="flex flex-col gap-4">
      {exercises.map(({ chapter, attachments: exercises }, index) => (
        exercises.length > 0 && <div key={chapter.hash} className="bg-card rounded min-h-[6em]">
          <ChapterHeader index={index + 1} />
          {exercises &&
            exercises.map(async (exercise, index) => (
              <Exercise
                key={exercise.hash}
                index={index + 1}
                chapter={chapter}
                exercise={exercise}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export const generateStaticParams = generateStaticParamsCommon("exercises");
