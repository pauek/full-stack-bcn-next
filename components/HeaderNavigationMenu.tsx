"use client";

import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { CrumbData } from "@/lib/content-server";
import { cn } from "@/lib/utils";
import Link from "next/link";
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash";

type Props = {
  crumbs: CrumbData[];
};
export function HeaderNavigationMenu({ crumbs }: Props) {
  return (
    <>
      {crumbs.length > 0 && <BreadCrumbsSlash className="ml-4 mr-2" />}
      <NavigationMenu>
        <NavigationMenuList className="p-0">
          {crumbs.map((crumb, i) => (
            <>
              {i > 0 && <BreadCrumbsSlash className="ml-10 mr-10" />}
              {crumb.siblings.length === 1 && (
                <Link
                  href={`/content/${crumb.path.join("/")}`}
                  className="block text-sm select-none space-y-1 rounded-md p-3 px-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground font-medium mx-1"
                >
                  {crumb.name}
                </Link>
              )}
              {crumb.siblings.length > 1 && (
                <NavigationMenuItem key={crumb.path.join(":")}>
                  <NavigationMenuTrigger className="px-2 py-1 mx-1">
                    {crumb.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="pr-1">
                    <ul className="flex flex-col w-[20em] list-none p-0 m-0">
                      {crumb.siblings.map((sib, i) => (
                        <NavigationMenuLink key={sib.path.join(":")} asChild>
                          <li>
                            <Link
                              href={`/content/${sib.path.join("/")}`}
                              className="block text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {sib.name}
                            </Link>
                          </li>
                        </NavigationMenuLink>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}
