import CoursePart from "@/components/CoursePart";
import StaticLayout from "@/components/StaticLayout";
import { getCourse } from "@/lib/content-server";

export default async function Home() {
  const course = await getCourse();
  const { parts } = course;
  return (
    <StaticLayout path={[]}>
      <div className="max-w-[54em] m-auto">
        {parts &&
          parts.map((part: any) => (
            <CoursePart key={part.path} path={[part.id]} />
          ))}
      </div>
    </StaticLayout>
  );
}
