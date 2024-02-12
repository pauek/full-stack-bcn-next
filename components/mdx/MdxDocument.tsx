import { FileReference } from "@/lib/data/data-backend";
import { cn } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import ImageForChapter from "./ImageForChapter";
import mdxComponents from "./mdx-components";

type _Props = {
  className?: string;
  text: string;
  imageMap: Map<string, FileReference>;
};
export default async function MdxDocument({ className = "", text, imageMap }: _Props) {
  const RenderError = () => {
    return (
      <div className="bg-red-600 text-foreground text-xl px-3 py-2 rounded">
        Error rendering MDX Document
        <pre>{text.split("\n").slice(0, 10).join("\n")}</pre>
      </div>
    );
  };

  return (
    <div className={cn(className, "m-auto max-w-[54em] mdx-document")}>
      <div className="bg-background text-sm rounded-md">
        <div className="max-w-[40em] min-w-0 relative">
          <ErrorBoundary fallback={<RenderError />}>
            <Suspense>
              <MDXRemote
                source={text}
                components={{
                  ...mdxComponents,
                  Image: ImageForChapter(imageMap),
                }}
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
