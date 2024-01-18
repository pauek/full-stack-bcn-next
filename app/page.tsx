import CoursePart from "@/components/CoursePart";
import StaticLayout from "@/components/StaticLayout";
import { getContentTree } from "@/lib/files/files";
import { notFound } from "next/navigation";

export default async function Home() {
  const course = await getContentTree([process.env.COURSE!]);
  if (course === null) {
    notFound();
  }
  const { children } = course;
  return (
    <StaticLayout path={[course.id]}>
      <div className="md:min-w-[36em] m-auto">
        {children &&
          children.map((part) => (
            <CoursePart key={part.id} part={part} />
          ))}
      </div>
    </StaticLayout>
  );
}
