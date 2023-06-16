import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getChapterDoc, type Chapter, getChapter } from "@/lib/content/content-server";

type ErrorProps = {
  chapter: Chapter;
}
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
          <MDXRemote source={doc} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
