import { CrumbData, getBreadcrumbs } from "@/lib/content-server";
import Link from "next/link";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";
import MobileMenu from "./MobileMenu";

type CrumbProps = {
  crumb: CrumbData;
  position: number;
  isLast: boolean;
};

const CrumbLink = ({ crumb, position, isLast }: CrumbProps) => {
  if (position === 0) {
    return <Link href={`/#${crumb.path[0]}`}>{crumb.name}</Link>;
  } else if (isLast) {
    return <div className="select-none">{crumb.name}</div>;
  } else {
    return <Link href={`/content/${crumb.path.join("/")}`}>{crumb.name}</Link>;
  }
};

const Crumb = ({ crumb, position, isLast }: CrumbProps) => {
  return (
    <>
      <div className={"mx-2 text-stone-300 "}>
        <BreadCrumbsSlash />
      </div>
      <CrumbLink crumb={crumb} position={position} isLast={isLast} />
    </>
  );
};

export default async function Header({ path }: { path: string[] }) {
  const crumbs = await getBreadcrumbs(path);
  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-white h-12 flex " +
        "flex-row items-center px-5 border-b z-20 shadow-sm overflow-visible"
      }
    >
      <Link href="/" className="font-bold">
        Full-stack Web Technologies
      </Link>
      <div className="hidden sm:flex flex-row items-center">
        {crumbs.length > 0 &&
          crumbs.map((cr, i) => (
            <Crumb
              key={cr.path.join("/")}
              crumb={cr}
              position={i}
              isLast={i === crumbs.length - 1}
            />
          ))}
      </div>
      {crumbs.length > 0 && (
        <div className="sm:hidden flex-1 flex flex-row justify-end">
          <MobileMenu>
            {crumbs.slice(0, crumbs.length-1).map((cr, i) => (
              <CrumbLink
                key={cr.path.join("/")}
                crumb={cr}
                position={i}
                isLast={i === crumbs.length - 1}
              />
            ))}
          </MobileMenu>
        </div>
      )}
    </header>
  );
}
