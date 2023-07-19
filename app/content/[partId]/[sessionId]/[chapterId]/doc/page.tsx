import ChapterDocument from "@/components/ChapterDocument";
import ChapterMenu from "@/components/ChapterMenu";

export type ChapterPageProps = {
  params: {
    partId: string;
    sessionId: string;
    chapterId: string;
  };
};

export default async function Page({ params }: ChapterPageProps) {
  const { partId, sessionId, chapterId } = params;
  const path = [partId, sessionId, chapterId];
  return (
    <>
      <ChapterMenu path={path} active="doc" />
      <ChapterDocument key={path.join("/")} id={["fullstack", ...path]} />
    </>
  );
}
