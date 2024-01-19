import { getBreadcrumbData, getPieceWithChildren } from "@/lib/files/files";
import Link from "next/link";
import { HeaderNavigationMenu } from "./HeaderNavigationMenu";
import MobileMenu from "./MobileMenu";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

export default async function Header({ path }: { path: string[] }) {
  const course = await getPieceWithChildren(path.slice(0, 1));
  if (course === null) {
    throw `Course with path ${path[0]} not found`;
  }
  const [part, ...crumbs] = await getBreadcrumbData(...path);
  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-white h-12 flex " +
        "flex-row items-center pl-5 border-b z-20 shadow-sm overflow-visible"
      }
    >
      <Link href="/" className="font-bold whitespace-nowrap overflow-ellipsis overflow-clip">
        {course.name}
      </Link>
      {part && (
        <div className="md:flex flex-row items-center hidden">
          <BreadCrumbsSlash className="ml-5 mr-5" />
          <div className="font-medium text-sm text-stone-400 mx-1">
            {part.name}
          </div>
        </div>
      )}
      <div className="md:flex flex-row items-center hidden">
        <HeaderNavigationMenu crumbs={crumbs} />
      </div>
      <div className="flex-1 md:hidden block"></div>
      <div className="md:hidden flex flex-col justify-center items-center">
        <MobileMenu crumbs={crumbs} />
      </div>
    </header>
  );
}
