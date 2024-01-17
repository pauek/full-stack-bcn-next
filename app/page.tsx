import CoursePart from "@/components/CoursePart";
import StaticLayout from "@/components/StaticLayout";
import { getCourse } from "@/lib/files/files";
import { notFound } from "next/navigation";

export default async function Home() {
  const course = await getCourse(process.env.COURSE!);
  if (course === null) {
    notFound();
  }
  const { parts } = course;
  return (
    <StaticLayout path={[course.id]}>
      <div className="max-w-[54em] m-auto">
        {parts &&
          parts.map(({ path, id }) => (
            <CoursePart key={path} path={[course.id, id]} />
          ))}
      </div>
    </StaticLayout>
  );
}
