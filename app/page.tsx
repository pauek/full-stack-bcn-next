import CoursePart from "@/components/CoursePart";
import StaticLayout from "@/components/StaticLayout";
import { getCourse } from "@/lib/content-server";

export default async function Home() {
  const course = await getCourse();
  const { parts } = course;
  return (
    <StaticLayout path={[]}>
      {parts &&
        parts.map((part: any) => <CoursePart key={part.path} id={[part.id]} />)}
    </StaticLayout>
  );
}
