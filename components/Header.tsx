"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

const getBreadcrumbs = async (segments: string[]): Promise<CrumbData[]> => {
  const response = await fetch(`/api/breadcrumbs/${segments.join("/")}`);
  return (await response.json()) as CrumbData[];
};

type CrumbData = {
  name: string;
  path: string[];
};

export const useBreadcrumbs = (): CrumbData[] => {
  // NOTE: Get rid of "content" which is first
  const [_, ...segments] = useSelectedLayoutSegments();
  console.log("useBreadcrumbs", { segments });
  const [crumbs, setCrumbs] = useState<CrumbData[]>([]);

  useEffect(() => {
    getBreadcrumbs(segments).then(setCrumbs);
  }, [segments.join("/")]);

  return crumbs;
};

const Crumb = ({ crumb, part }: { crumb: CrumbData; part: boolean }) => {
  return (
    <>
      <div className="mx-2 text-stone-300">
        <BreadCrumbsSlash />
      </div>
      {part ? (
        <div>{crumb.name}</div>
      ) : (
        <Link href={`/content/${crumb.path.join("/")}`}>{crumb.name}</Link>
      )}
    </>
  );
};

export default function Header() {
  const crumbs = useBreadcrumbs();
  return (
    <header className="h-12 flex flex-row items-center px-5 border-b">
      <Link href="/" className="font-bold">
        Full-stack Web Technologies
      </Link>
      {crumbs.length > 0 &&
        crumbs.map((cr, i) => (
          <Crumb key={cr.path.join("/")} crumb={cr} part={i == 0} />
        ))}
    </header>
  );
}
