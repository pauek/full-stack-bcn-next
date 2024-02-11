import data from "@/lib/data";
import { MDXRemote } from "next-mdx-remote/rsc";
import NextImage from "next/image";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import mdxComponents from "./mdx/mdx-components";
import { attachmentUrl } from "@/lib/urls";
import { ContentPiece } from "@/lib/adt";

type ChapterProps = {
  chapter: ContentPiece;
};
export default async function ChapterDocument({ chapter }: ChapterProps) {
  const doc = await data.getPieceDocument(chapter);

  const RenderError = () => {
    return (
      <div id={chapter?.id} className="bg-red-600 text-foreground text-xl px-3 py-2 rounded">
        Error in &quot;{chapter?.name}&quot;
      </div>
    );
  };

  const images = await data.getPieceAttachmentList(chapter, "image");
  const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]));

  const Image = (props: React.ComponentProps<"img">) => (
    // Hay que insertar el id del Chapter para que el documento
    // pueda referirse a la imagen con un path relativo
    <div className="my-4">
      <NextImage
        className="py-3 border"
        src={attachmentUrl(chapterImageMap.get(props.src!)!)}
        alt={props.alt || "image"}
        width={Number(props.width)}
        height={Number(props.height)}
      />
    </div>
  );

  return (
    <div className="relative m-auto max-w-[54em] mdx-document">
      <div className="p-2.5 lg:p-4 bg-background text-sm rounded-md">
        <div className="max-w-[40em] min-w-0">
          {doc && (
            <ErrorBoundary fallback={<RenderError />}>
              <Suspense>
                <MDXRemote
                  source={doc.buffer}
                  components={{ ...mdxComponents, Image }}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [[rehypeHighlight, { ignoreMissing: true }]],
                    },
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
