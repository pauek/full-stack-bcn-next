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
      <ChapterMenu path={path} active="slides" />
      <p>Slides!</p>
    </>
  );
}
