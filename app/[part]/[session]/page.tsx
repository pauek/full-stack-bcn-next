import { ContentDir, loadContent } from "@/lib/content/content";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";

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
    <div className="p-4 max-w-2xl m-auto">
      <h1>{dir.name}</h1>
      <div className="text-sm">
        {dir.children?.map((ch) => (
          <Chapter key={ch.path} chapter={ch} />
        ))}
      </div>
    </div>
  );
}
