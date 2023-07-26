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

type ChapterProps = {
  path: string[];
};
export default async function ChapterDocument({ path }: ChapterProps) {
  const chapter = await getChapter(path);
  const doc = await getChapterDoc(path);

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
    <div className="relative m-auto max-w-[54em] mt-3 mb-3">
      <div className="mx-4 px-4 pt-4 bg-white pb-10 text-sm">
        <div className="max-w-[40em]">
          <ErrorBoundary fallback={<RenderError />}>
            <Suspense>
              <MDXRemote
                source={doc}
                components={{
                  ...mdxComponents,
                  Image: (props: React.ComponentProps<"img">) => (
                    // Hay que insertar el id del Chapter para que el documento
                    // pueda referirse a la imagen con un path relativo
                    <NextImage
                      className="py-3 border"
                      src={`${process.env.CONTENT_SERVER}/${path.join(
                        "/"
                      )}/images/${props.src}`}
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
