import { getChapter, getChapterDoc } from "@/lib/content/content-server";
import { MDXRemote } from "next-mdx-remote/rsc";
import NextImage from "next/image";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import mdxComponents from "./mdx/mdx-components";

// import bash from "highlight.js/lib/languages/bash";
// import js from "highlight.js/lib/languages/javascript";
// import ts from "highlight.js/lib/languages/typescript";

type ChapterProps = {
  id: string[];
};
export default async function Chapter({ id }: ChapterProps) {
  const chapter = await getChapter(id);
  const doc = await getChapterDoc(id);

  const RenderError = () => {
    return (
      <div
        id={chapter?.id}
        className="bg-red-600 text-white text-xl px-3 py-2 rounded"
      >
        Error in &quot;{chapter?.name}&quot;
      </div>
    );
  };

  return (
    <div className="py-2">
      <ErrorBoundary
        fallback={<RenderError />}
      >
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
                  src={`/api/images/${id.join("/")}/images/${props.src}`}
                  alt={props.alt || "image"}
                  width={Number(props.width)}
                  height={Number(props.height)}
                />
              ),
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypeHighlight, {
                  ignoreMissing: true
                }]],
              },
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
