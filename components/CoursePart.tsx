import { ContentPiece } from "@/lib/adt";
import { cn, range } from "@/lib/utils";
import SessionCard from "./SessionCard";

type CoursePartProps = {
  part: ContentPiece;
};
export default async function CoursePart({ part }: CoursePartProps) {
  const sessionsInRow = (n: number) =>
    part.children?.filter((s: any) => s.row === n);

  const Row = ({ n }: { n: number }) => (
    <div key={n} className="flex flex-row justify-center px-2">
      {sessionsInRow(n)?.map((session: any) => (
        <SessionCard key={session.path} session={session} />
      ))}
    </div>
  );

  return (
    <div id={part.id} className="pt-3 pb-5">
      <h4
        className={cn(
          "text-stone-400 mb-2 text-center uppercase font-semibold",
          "flex flex-row justify-center items-center gap-3 px-2"
        )}
      >
        <div className="h-0 border-t border-stone-300 border-dashed flex-1"></div>
        {part.name}
        <div className="h-0 border-t border-stone-300 border-dashed flex-1"></div>
      </h4>
      {range(0, 10).map((n) => (
        <Row key={n} n={n} />
      ))}
    </div>
  );
}
