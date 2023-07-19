import type { Session } from "@/lib/content-server";
import { getCourse, getPart, getSession } from "@/lib/content-server";
import { range } from "@/lib/utils";
import Link from "next/link";

type SessionProps = {
  id: string[];
};
const Session = async ({ id }: SessionProps) => {
  const session = await getSession(id);
  return (
    <Link href={`/content/${id.slice(1).join("/")}`} className="w-1/5">
      <div
        className={
          "text-sm hover:bg-stone-50 hover:border-stone-400" +
          " bg-white px-3 py-1.5 border rounded shadow m-1"
        }
      >
        {session.name}
      </div>
    </Link>
  );
};

type PartProps = {
  id: string[];
};
const Part = async ({ id }: PartProps) => {
  const part = await getPart(id);

  const sessionsInRow = (n: number) =>
    part.sessions.filter((s: any) => s.row === n);

  const Row = ({ n }: { n: number }) => (
    <div key={n} className="flex flex-row justify-center">
      {sessionsInRow(n)?.map((session: any) => (
        <Session key={session.path} id={["fullstack", part.id, session.id]} />
      ))}
    </div>
  );

  return (
    <div className="py-3 border-t relative last-of-type:border-b first-of-type:mt-1">
      <h4 className="text-stone-500 mb-2 text-sm font-light absolute top-1 mt-0">
        {part.name}
      </h4>
      {range(0, 10).map((n) => (
        <Row key={n} n={n} />
      ))}
    </div>
  );
};

export default async function Home() {
  const course = await getCourse(["fullstack"]);
  const { parts } = course;
  return (
    <div className="max-w-4xl m-auto py-3">
      {parts &&
        parts.map((part: any) => (
          <Part key={part.path} id={[course.id, part.id]} />
        ))}
    </div>
  );
}
