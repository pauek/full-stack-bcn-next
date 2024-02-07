import Part from "@/components/Part";
import data from "@/lib/data";
import { env } from "@/lib/env.mjs";

import { notFound } from "next/navigation";

export default async function Home() {
  const course = await data.getContentTree([env.COURSE_ID], { level: 2 });
  if (course === null) {
    notFound();
  }
  const { children } = course;
  return (
    <div className="m-auto max-w-[38em]">
      <div className="w-full sm:w-[38em]">
        {children && children.map((part) => <Part key={part.hash} part={part} />)}
      </div>
    </div>
  );
}
