import { getChapter, getChapterDoc } from "@/lib/content-server";
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

const { CONTENT_SERVER } = process.env;

type ChapterProps = {
  id: string[];
};
export default async function ChapterDocument({ id }: ChapterProps) {
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
    <div className="flex flex-row justify-center">
      <div className="relative m-auto w-[40em]">
        <div className="px-8 pt-4 max-w-2xl bg-white pb-20 text-sm">
          <ErrorBoundary fallback={<RenderError />}>
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
                      src={`${CONTENT_SERVER}/${id.join("/")}/images/${
                        props.src
                      }`}
                      alt={props.alt || "image"}
                      width={Number(props.width)}
                      height={Number(props.height)}
                    />
                  ),
                }}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      [
                        rehypeHighlight,
                        {
                          ignoreMissing: true,
                        },
                      ],
                    ],
                  },
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
