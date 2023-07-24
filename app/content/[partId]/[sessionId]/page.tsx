import {
  Chapter,
  Session,
  getCourse,
  getPart,
  getSession,
} from "@/lib/content-server";
import Link from "next/link";

export async function generateStaticParams() {
  const { parts } = await getCourse();
  const result = [];
  for (const part of parts) {
    const { sessions } = await getPart([part.id]);
    for (const session of sessions) {
      result.push({ params: { partId: part.id, sessionId: session.id } });
    }
  }
  return result;
}

type ChapterCardProps = {
  path: string[];
  chapter: Chapter;
};
const ChapterCard = ({ path, chapter }: ChapterCardProps) => {
  return (
    <Link href={`/content/${path!.join("/")}/${chapter.id}`}>
      <div className="border p-3 rounded shadow-sm bg-white hover:border-black">
        <div className="font-bold">{chapter.name}</div>
      </div>
    </Link>
  );
};

type SessionMenuProps = {
  path: string[];
  session: Session;
};
const SessionMenu = ({ path, session }: SessionMenuProps) => {
  if (!session) {
    return <></>;
  }
  return (
    <div className="gap-2 grid lg:grid-cols-2 max-md:grid-cols-1">
      {session.chapters.map((chapter) => (
        <ChapterCard key={chapter.id} path={path} chapter={chapter} />
      ))}
    </div>
  );
};

type PageProps = {
  params: {
    partId: string;
    sessionId: string;
  };
};
export default async function Page({ params }: PageProps) {
  const { partId, sessionId } = params;
  const session = await getSession([partId, sessionId]);
  return (
    <div className="p-5 max-w-4xl m-auto">
      <div id="top" className="absolute top-0" />
      <h2 className="pt-6 pb-6">{session.name}</h2>
      <SessionMenu path={[partId, sessionId]} session={session} />
    </div>
  );
}
