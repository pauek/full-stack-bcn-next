import CoursePart from "@/components/CoursePart";
import { getCourse } from "@/lib/content-server";

export default async function Home() {
  const course = await getCourse(["fullstack"]);
  const { parts } = course;
  return (
    <div className="max-w-4xl m-auto py-3">
      {parts &&
        parts.map((part: any) => (
          <CoursePart key={part.path} id={[course.id, part.id]} />
        ))}
    </div>
  );
}
