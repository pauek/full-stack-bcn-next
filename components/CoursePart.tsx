import { getPart } from "@/lib/files/files";
import SessionButton from "./SessionButton";
import { range } from "@/lib/utils";

type CoursePartProps = {
  path: string[];
};
export default async function CoursePart({ path }: CoursePartProps) {
  const part = await getPart(path);

  if (part === null) {
    return <div>ERROR: Part with ${path} not found.</div>
  }

  const sessionsInRow = (n: number) =>
    part.children.filter((s: any) => s.row === n);

  const Row = ({ n }: { n: number }) => (
    <div key={n} className="flex flex-row justify-center">
      {sessionsInRow(n)?.map((session: any) => (
        <SessionButton key={session.path} path={[...path, session.id]} />
      ))}
    </div>
  );

  return (
    <div id={part.id} className="pt-2 pb-4 max-w-[52em]">
      <h4 className={"text-stone-400 mb-2 text-center uppercase font-semibold"}>
        {part.name}
      </h4>
      {range(0, 10).map((n) => (
        <Row key={n} n={n} />
      ))}
    </div>
  );
}
