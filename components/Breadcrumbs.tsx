import { CrumbData, getBreadcrumbs } from "@/lib/content-server";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SiblingsDropdown from "./SiblingsDropdown";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

type CrumbProps = {
  crumb: CrumbData;
};

const CrumbLink = ({ crumb }: CrumbProps) => {
  const showDropdown = crumb.siblings.length > 1;
  return (
    <div
      className={
        "flex flex-row gap-2 items-end relative " + (showDropdown ? "pr-8" : "")
      }
    >
      <Link href={`/content/${crumb.path.join("/")}`}>{crumb.name}</Link>
      {showDropdown && (
        <div className="absolute top-0 right-0">
          <SiblingsDropdown siblings={crumb.siblings} />
        </div>
      )}
    </div>
  );
};

type Props = {
  path: string[];
};
export default async function Breadcrumbs({ path }: Props) {
  const [__part, ...crumbs] = await getBreadcrumbs(path);
  return (
    <>
      <div className="hidden md:flex flex-row items-center">
        {crumbs.length > 0 &&
          crumbs.map((cr, i) => (
            <>
              <div className={"mx-2 text-stone-300 "}>
                <BreadCrumbsSlash />
              </div>
              <CrumbLink crumb={cr} />
            </>
          ))}
      </div>
      {crumbs.length > 0 && (
        <div className="md:hidden flex-1 flex flex-row justify-end">
          <MobileMenu>
            {crumbs.slice(0, crumbs.length - 1).map((cr, i) => (
              <CrumbLink key={cr.path.join("/")} crumb={cr} />
            ))}
          </MobileMenu>
        </div>
      )}
    </>
  );
}
