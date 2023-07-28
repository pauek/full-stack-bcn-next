import { getCourse } from "@/lib/content-server";
import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";

export default async function Header({ path }: { path: string[] }) {
  const course = await getCourse();
  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-white h-12 flex " +
        "flex-row items-center px-5 border-b z-20 shadow-sm overflow-visible"
      }
    >
      <Link href="/" className="font-bold">
        {course.name}
      </Link>
      <Breadcrumbs path={path} />
    </header>
  );
}
