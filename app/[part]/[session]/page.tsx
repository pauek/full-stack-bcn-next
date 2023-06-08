import Chapter from "@/components/Chapter";
import { loadContent } from "@/lib/content/content";
import { notFound } from "next/navigation";

type Props = {
  params: {
    part: string;
    session: string;
  };
};

export default async function Page({ params }: Props) {
  const { part, session } = params;
  const [_, sessionMap] = await loadContent();
  const dir = sessionMap.get(`${part}/${session}`);
  if (!dir) {
    notFound();
  }
  return (
    <div>
      <div id="top" className="absolute top-0" />
      <div className="border-b bg-white">
        <h1 className="max-w-6xl m-auto mt-0 py-6 font-bold text-4xl">
          {dir.name}
        </h1>
      </div>
      <div className="relative flex flex-row m-auto max-w-6xl">
        <aside className="flex-1 flex flex-row items-start">
          <div className="flex flex-col pt-4 pr-10 sticky top-0 text-stone-400 transition-opacity">
            <a href="#top" className="mb-4 text-sm">
              {dir.name.toUpperCase()}
            </a>
            {dir.children?.map((ch) => (
              <a
                key={ch.path}
                href={`#${ch.metadata.slug}`}
                className="mb-2 text-sm hover:text-stone-500"
              >
                {ch.name}
              </a>
            ))}
          </div>
        </aside>
        <div className="px-10 pt-6 max-w-2xl bg-white pb-20">
          <div className="text-sm">
            {dir.children?.map((ch) => (
              <Chapter key={ch.path} chapter={ch} />
            ))}
          </div>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const [_, sessionMap] = await loadContent();
  const result = [];
  for (const key in sessionMap.keys()) {
    const [part, session] = key.split("/");
    result.push({ params: { part, session } });
  }
  return result;
}
