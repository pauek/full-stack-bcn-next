import {
  Session,
  getCourse,
  getCourseList,
  getPart,
  getSession,
} from "@/lib/content-server";
import Link from "next/link";

type Props = {
  params: {
    partId: string;
    sessionId: string;
  };
};

const SessionMenu = ({
  path,
  session,
}: {
  path: string[];
  session: Session;
}) => {
  return (
    <aside className="flex-1 flex flex-row items-start">
      <div className="flex flex-col pt-4 pr-10 sticky top-0 text-stone-400 transition-opacity">
        {session.chapters.map((ch: any) => (
          <Link
            key={ch.path}
            href={`/content/${path.join("/")}/${ch.id}`}
            className="mb-2 text-sm hover:text-stone-500"
          >
            {ch.name}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default async function Page({ params }: Props) {
  const { partId, sessionId } = params;
  const session = await getSession(["fullstack", partId, sessionId]);

  return (
    <div>
      <div id="top" className="absolute top-0" />
      <div className="relative flex flex-row m-auto max-w-6xl">
        <SessionMenu path={[partId, sessionId]} session={session} />
        <div className="flex-1" />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const courseList = await getCourseList();
  const result = [];
  for (const course of courseList) {
    const { parts } = await getCourse([course.id]);
    for (const part of parts) {
      const { sessions } = await getPart([course.id, part.id]);
      for (const session of sessions) {
        result.push({ params: { partId: part.id, sessionId: session.id } });
      }
    }
  }
  return result;
}
