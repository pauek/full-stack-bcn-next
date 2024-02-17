import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { cn } from "@/lib/utils";

type ExerciseProps = {
  chapter: ContentPiece;
  exercise: FileReference;
  index: number;
};
export default async function Exercise({ index, chapter, exercise }: ExerciseProps) {
  const text = await data.getAttachmentBytes(chapter, exercise);

  return (
    text && (
      <div className="md:flex md:flex-row flex-col mx-2.5 mb-2.5">
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
          <MdxDocument className="p-2.5" text={text?.toString()} />
        </div>
      </div>
    )
  );
}
