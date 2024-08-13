"use client"

import * as React from "react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"
import BreadCrumbsSlash from "./icons/BreadCrumbsSlash"
import CheckMark from "./icons/CheckMark"
import { pieceUrlPath } from "@/lib/urls"
import { CrumbData } from "@/lib/data/data-backend"

type Props = {
  crumbs: CrumbData[]
}
export function HeaderNavigationMenu({ crumbs }: Props) {
  return (
    <>
      {crumbs.length > 0 && <BreadCrumbsSlash className="ml-4 mr-2" />}
      <NavigationMenu>
        <NavigationMenuList className="pl-0">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb.idpath.join(":")}>
              {i > 0 && <BreadCrumbsSlash />}
              {crumb.siblings && crumb.siblings.length === 1 && (
                <Link
                  href={pieceUrlPath(crumb.idpath)}
                  className={
                    "block text-sm select-none space-y-1 rounded-md " +
                    "p-3 px-4 leading-none no-underline outline-none " +
                    "transition-colors hover:bg-accent " +
                    "hover:text-accent-foreground focus:bg-accent " +
                    "focus:text-accent-foreground font-medium mx-1"
                  }
                >
                  {crumb.name}
                </Link>
              )}
              {crumb.siblings && crumb.siblings.length > 1 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-2 py-1 mx-1">
                    {crumb.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="flex flex-col gap-0 w-[20em] list-none p-1 py-2 pr-3 m-0">
                      {crumb.siblings.map((sib, i) => {
                        const isCurrent = sib.idpath.join("/") === crumb.idpath.join("/")
                        return (
                          <NavigationMenuLink key={sib.idpath.join(":")} asChild>
                            <li>
                              <Link
                                href={pieceUrlPath(sib.idpath)}
                                className={cn(
                                  "flex flex-row items-center text-sm select-none " +
                                    "space-y-1 rounded-md p-3 leading-none " +
                                    "no-underline outline-none transition-colors " +
                                    "hover:bg-accent hover:text-accent-foreground " +
                                    "focus:bg-accent focus:text-accent-foreground",
                                  isCurrent ? "bg-accent" : "",
                                )}
                              >
                                {sib.name}
                                {isCurrent && <CheckMark className="ml-2" size={20} />}
                              </Link>
                            </li>
                          </NavigationMenuLink>
                        )
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </React.Fragment>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  )
}
