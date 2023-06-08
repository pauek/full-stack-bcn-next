import { ContentDir } from "@/lib/content/content";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MDXRemote } from "next-mdx-remote/rsc";

const Error = ({ chapter }: { chapter: ContentDir }) => {
  return (
    <div
      id={chapter.metadata.slug}
      className="bg-red-600 text-white text-xl px-3 py-2 rounded"
    >
      Error in &quot;{chapter.name}&quot;
    </div>
  );
};

export default function Chapter({ chapter }: { chapter: ContentDir }) {
  return (
    <div className="py-2">
      <ErrorBoundary fallback={<Error chapter={chapter} />}>
        <Suspense>
          <h2 id={chapter.metadata.slug}>{chapter.name}</h2>
          {/* @ts-expect-error Server Component */}
          <MDXRemote source={chapter.doc} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
