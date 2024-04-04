import Chapter from "@/components/Chapter";
import Exercise from "@/components/Exercise";
import SlideGrid from "@/components/SlideGrid";
import { FileType } from "@/data/schema";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";
import { attachmentUrl } from "@/lib/urls";
import { ChapterPageProps, getChapterAttachments, getChapterOrNotFound } from "./utils";
import CollapsibleSection from "@/components/Collapsible";
import SlideShow from "@/components/icons/SlideShow";
import { ExerciseIcon } from "@/components/icons/ExerciseIcon";

export default async function Page({ params }: ChapterPageProps) {
  const chapter = await getChapterOrNotFound({ params });
  const slides = await getChapterAttachments(chapter, FileType.slide);
  const exercises = await getChapterAttachments(chapter, FileType.exercise);

  const Slides = () =>
    slides.length > 0 && (
      <CollapsibleSection title="SLIDES" className="border bg-zinc-200 dark:bg-zinc-900" icon={<SlideShow size={14} />}>
        <SlideGrid slides={slides.map(attachmentUrl)} />
      </CollapsibleSection>
    );

  const Document = () => (
    <div className="flex flex-col justify-start">
      <Chapter chapter={chapter} />
    </div>
  );

  const Exercises = () =>
    exercises.length > 0 && (
      <CollapsibleSection title="EXERCISES" className="border bg-stone-50 dark:bg-stone-900" icon={<ExerciseIcon />}>
        {exercises.map(async (exercise, index) => (
          <Exercise key={exercise.hash} index={index + 1} chapter={chapter} exercise={exercise} />
        ))}
      </CollapsibleSection>
    );

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Slides />
      <Document />
      <Exercises />
    </div>
  );
}

export const generateStaticParams = async () => {
  const course = await data.getPiece([env.COURSE_ID]);
  if (!course) {
    return [];
  }
  return (await data.getAllIdpaths(course.idpath))
    .filter((path) => path.length === 4)
    .map(([course, part, session, chapter]) => ({ course, part, session, chapter }));
};
