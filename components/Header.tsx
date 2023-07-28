import { getBreadcrumbs, getCourse } from "@/lib/content-server";
import Link from "next/link";
import { HeaderNavigationMenu } from "./HeaderNavigationMenu";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";
import MobileMenu from "./MobileMenu";

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
      <div className="md:hidden block">
        <MobileMenu>
          {crumbs.length > 0 && crumbs.slice(-1)[0].siblings.map((sib) => (
            <Link
              href={`/content/${sib.path.join("/")}`}
              className="text-sm"
              key={sib.path.join(":")}
            >
              {sib.name}
            </Link>
          ))}
        </MobileMenu>
      </div>
    </header>
  );
}
