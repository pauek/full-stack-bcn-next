"use client";

import { CrumbData } from "@/lib/content-server";
import MobileMenuIcon from "./icons/MobileMenuIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import CheckMark from "./icons/CheckMark";
import { ScrollArea } from "./ui/scroll-area";

type Props = {
  crumbs: CrumbData[];
};
export default function MobileMenu({ crumbs }: Props) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MobileMenuIcon size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-fit">
        {crumbs.map((crumb, i) => (
          <>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup key={crumb.path.join(":")}>
              {crumb.siblings.map((sib) => {
                const isCurrent = sib.path.join("/") === crumb.path.join("/");
                return (
                  <DropdownMenuItem
                    key={sib.path.join(":")}
                    className={cn("py-3 text-md", isCurrent ? "bg-accent" : "")}
                    onSelect={() =>
                      router.push(`/content/${sib.path.join("/")}`)
                    }
                  >
                    {sib.name}
                    {isCurrent && <CheckMark className="ml-2" size={20} />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
