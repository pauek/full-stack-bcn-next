import CoursePart from "@/components/CoursePart";
import { getCourse } from "@/lib/content-server";

export default async function Home() {
  const course = await getCourse();
  const { parts } = course;
  return (
    <div className="w-[54em] m-auto py-3">
      {parts &&
        parts.map((part: any) => (
          <CoursePart key={part.path} id={[part.id]} />
        ))}
    </div>
  );
}
