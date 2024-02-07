"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import DarkModeSwitch from "./DarkModeSwitch";
import { HeaderNavigationMenu } from "./HeaderNavigationMenu";
import MobileMenu from "./MobileMenu";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";
import { useEffect, useState } from "react";
import { ContentPiece } from "@/lib/adt";
import type { CrumbData } from "@/lib/data/data-backend";
import { backend as data } from "@/lib/data/db";
import { getBreadcrumbData } from "@/lib/data/common";

export default function Header({ course }: { course: ContentPiece }) {
  const [_c, _courseId, part, session, chapter] = useSelectedLayoutSegments();
  const [partCrumb, setPart] = useState<CrumbData | undefined>();
  const [crumbs, setCrumbs] = useState<CrumbData[]>([]);

  useEffect(() => {
    const idpath = [course.id, part, session, chapter].filter(Boolean);
    console.log("Idpath", { idpath });
    getBreadcrumbData.call(data, ...idpath).then(([part, ...rest]) => {
      setPart(part);
      setCrumbs(rest);
    });
  }, [course.id, part, session, chapter]);

  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-card h-12 flex " +
        "flex-row items-center border-b z-20 shadow-sm overflow-visible"
      }
    >
      <div className="md:hidden flex flex-col justify-center items-center mr-2">
        <MobileMenu crumbs={crumbs} />
      </div>
      <Link href="/" className="font-bold ml-3 whitespace-nowrap overflow-ellipsis overflow-clip header">
        {course.name}
      </Link>
      <div className="flex-1 block"></div>
      
      <DarkModeSwitch className="mr-5" />
    </header>
  );
}
