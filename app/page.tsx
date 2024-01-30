import Part from "@/components/Part";
import data from "@/lib/data";
import { notFound } from "next/navigation";

const courseId = process.env.COURSE_ID!;

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
