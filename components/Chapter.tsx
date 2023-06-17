import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getChapterDoc, getChapter } from "@/lib/content/content-server";
import type { Chapter } from "@/lib/content/content-server";

import mdxComponents from "./mdx/mdx-components";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import bash from "highlight.js/lib/languages/bash";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";

type ErrorProps = {
  chapter: Chapter;
};
const Error = ({ chapter }: ErrorProps) => {
  return (
    <div
      id={chapter.id}
      className="bg-red-600 text-white text-xl px-3 py-2 rounded"
    >
      Error in &quot;{chapter.name}&quot;
    </div>
  );
};

type ChapterProps = {
  id: string[];
};
export default async function Chapter({ id }: ChapterProps) {
  const chapter = await getChapter(id);
  const doc = await getChapterDoc(id);
  return (
    <div className="py-2">
      <ErrorBoundary fallback={<Error chapter={chapter} />}>
        <Suspense>
          <h2 id={chapter.id}>{chapter.name}</h2>
          <MDXRemote
            source={doc}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  // Los ítems de esta lista son un array con el plugin y 
                  // sus opciones
                  [
                    // Tela lo que ha costado encontrar esto:
                    // https://mdxjs.com/packages/mdx/#optionsrehypeplugins
                    rehypeHighlight,
                    {
                      languages: { js, ts, bash },
                    },
                  ],
                ],
              },
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
