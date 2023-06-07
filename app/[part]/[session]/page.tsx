import { ContentDir, loadContent } from "@/lib/content/content";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import Link from "next/link";

type Props = {
  params: {
    part: string;
    session: string;
  };
};

const Chapter = ({ chapter }: { chapter: ContentDir }) => (
  <div className="py-2">
    <Suspense>
      <h2>{chapter.name}</h2>
      {/* @ts-expect-error Server Component */}
      <MDXRemote source={chapter.doc} />
    </Suspense>
  </div>
);

export default async function Page({ params }: Props) {
  const { part, session } = params;
  const [_, sessionMap] = await loadContent();
  const dir = sessionMap.get(`${part}/${session}`);
  if (!dir) {
    notFound();
  }
  return (
    <div className="relative flex flex-rowm-auto">
      <aside className="flex-1 flex flex-row justify-end items-start">
        <div className="flex flex-col p-6 sticky top-0">
          <Link href="#">First thing in the menu</Link>
          <Link href="#">Second thing</Link>
          <Link href="#">Third</Link>
        </div>
      </aside>
      <div className="p-10 max-w-2xl bg-white border-l-2 border-r-2 pb-20">
        <h1>{dir.name}</h1>
        <div className="text-sm">
          {dir.children?.map((ch) => (
            <Chapter key={ch.path} chapter={ch} />
          ))}
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}
