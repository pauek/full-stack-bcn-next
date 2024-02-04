import Part from "@/components/Part";
import data from "@/lib/data";
import { COURSE_ID } from "@/lib/env";
import { notFound } from "next/navigation";

const courseId = COURSE_ID;

export default async function Home() {
  const course = await data.getContentTree([courseId], { level: 2 });
  if (course === null) {
    notFound();
  }
  const { children } = course;
  return (
    <div className="w-full sm:w-[36em]">
      {children && children.map((part) => <Part key={part.hash} part={part} />)}
    </div>
  );
}
