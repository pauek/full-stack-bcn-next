import { MDXRemote } from "next-mdx-remote/rsc";
import NextImage from "next/image";
import { Suspense } from "react";

import { FileReference } from "@/lib/data/data-backend";
import { attachmentUrl } from "@/lib/urls";
import { ErrorBoundary } from "react-error-boundary";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import mdxComponents from "./mdx-components";
import { cn } from "@/lib/utils";

type _Props = {
  className?: string;
  text: string;
  imageMap: Map<string, FileReference>;
};
export default async function MdxDocument({ className = "", text, imageMap }: _Props) {
  const Image = (props: React.ComponentProps<"img">) => (
    // Hay que insertar el id del Chapter para que el documento
    // pueda referirse a la imagen con un path relativo
    <div className="py-3 border my-4">
      <NextImage
        src={attachmentUrl(imageMap.get(props.src!)!)}
        alt={props.alt || "image"}
        width={Number(props.width)}
        height={Number(props.height)}
      />
    </div>
  );

  const RenderError = () => {
    return (
      <div className="bg-red-600 text-foreground text-xl px-3 py-2 rounded">
        Error rendering MDX Document
        <pre>{text.split("\n").slice(0, 10).join("\n")}</pre>
      </div>
    );
  };

  return (
    <div className={cn(className, "relative m-auto max-w-[54em] mdx-document")}>
      <div className="bg-background text-sm rounded-md">
        <div className="max-w-[40em]">
          <ErrorBoundary fallback={<RenderError />}>
            <Suspense>
              <MDXRemote
                source={text}
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
        </div>
      </div>
    </div>
  );
}
