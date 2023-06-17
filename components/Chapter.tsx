import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getChapterDoc, getChapter } from "@/lib/content/content-server";
import type { Chapter } from "@/lib/content/content-server";
import NextImage from 'next/image';

import mdxComponents from "./mdx/mdx-components";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

// import bash from "highlight.js/lib/languages/bash";
// import js from "highlight.js/lib/languages/javascript";
// import ts from "highlight.js/lib/languages/typescript";

const { CONTENT_SERVER } = process.env;

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
            components={{
              ...mdxComponents,
              Image: (props: React.ComponentProps<"img">) => (
                // Hay que insertar el id del Chapter para que el documento
                // pueda referirse a la imagen con un path relativo
                <NextImage
                  className="py-3 border"
                  src={`${CONTENT_SERVER}/${id.join("/")}/images/${props.src}`}
                  alt={props.alt || "image"}
                />
              ),
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
