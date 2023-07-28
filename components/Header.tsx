import { getBreadcrumbs, getCourse } from "@/lib/content-server";
import Link from "next/link";
import { HeaderNavigationMenu } from "./HeaderNavigationMenu";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

export default async function Header({ path }: { path: string[] }) {
  const course = await getCourse();
  const [part, ...crumbs] = await getBreadcrumbs(path);
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
      {part && (
        <>
          <BreadCrumbsSlash className="ml-5 mr-5" />
          <div className="font-medium text-sm text-stone-400 mx-1">{part.name}</div>
        </>
      )}
      <HeaderNavigationMenu crumbs={crumbs} />
    </header>
  );
}
