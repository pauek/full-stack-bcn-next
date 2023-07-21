import { getPart } from "@/lib/content-server";
import SessionButton from "./SessionButton";
import { range } from "@/lib/utils";

type CoursePartProps = {
  id: string[];
};
export default async function CoursePart({ id }: CoursePartProps) {
  const part = await getPart(id);

  const sessionsInRow = (n: number) =>
    part.sessions.filter((s: any) => s.row === n);

  const Row = ({ n }: { n: number }) => (
    <div key={n} className="flex flex-row justify-center">
      {sessionsInRow(n)?.map((session: any) => (
        <SessionButton
          key={session.path}
          id={[part.id, session.id]}
        />
      ))}
    </div>
  );

  return (
    <div id={part.id} className="py-3 border-t relative last-of-type:border-b first-of-type:mt-1">
      <h4 className="text-stone-500 mb-2 text-sm font-light absolute top-1 mt-0">
        {part.name}
      </h4>
      {range(0, 10).map((n) => (
        <Row key={n} n={n} />
      ))}
    </div>
  );
};