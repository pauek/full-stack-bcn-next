import CoursePart from "@/components/CoursePart";
import StaticLayout from "@/components/StaticLayout";
import { getContentPiece } from "@/lib/files/files";
import { notFound } from "next/navigation";

export default async function Home() {
  const course = await getContentPiece([process.env.COURSE!]);
  if (course === null) {
    notFound();
  }
  const { children: parts } = course;
  return (
    <StaticLayout path={[course.id]}>
      <div className="md:min-w-[36em] m-auto">
        {parts &&
          parts.map(({ path, id }) => (
            <CoursePart key={path} path={[course.id, id]} />
          ))}
      </div>
    </StaticLayout>
  );
}
