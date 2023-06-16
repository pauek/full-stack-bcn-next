import Chapter from "@/components/Chapter";
import {
  getCourse,
  getCourseList,
  getPart,
  getSession,
} from "@/lib/content/content-server";

type Props = {
  params: {
    partId: string;
    sessionId: string;
  };
};

export default async function Page({ params }: Props) {
  const { partId, sessionId } = params;
  const session = await getSession(["fullstack", partId, sessionId]);

  return (
    <div>
      <div id="top" className="absolute top-0" />
      <div className="border-b bg-white">
        <h1 className="max-w-6xl m-auto mt-0 py-6 font-bold text-4xl">
          {session.name}
        </h1>
      </div>
      <div className="relative flex flex-row m-auto max-w-6xl">
        <aside className="flex-1 flex flex-row items-start">
          <div className="flex flex-col pt-4 pr-10 sticky top-0 text-stone-400 transition-opacity">
            <a href="#top" className="mb-4 text-sm">
              {session.name.toUpperCase()}
            </a>
            {session.chapters.map((ch: any) => (
              <a
                key={ch.path}
                href={`#${ch.id}`}
                className="mb-2 text-sm hover:text-stone-500"
              >
                {ch.name}
              </a>
            ))}
          </div>
        </aside>
        <div className="px-10 pt-6 max-w-2xl bg-white pb-20">
          <div className="text-sm">
            {session.chapters.map((ch: any) => (
              <Chapter
                key={ch.path}
                id={["fullstack", partId, session.id, ch.id]}
              />
            ))}
          </div>
        </div>
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
