"use client";

import { CrumbData } from "@/lib/data/files/files";
import { cn } from "@/lib/utils";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import CheckMark from "./icons/CheckMark";
import MobileMenuIcon from "./icons/MobileMenuIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { pieceUrl } from "@/lib/urls";

type Props = {
  crumbs: CrumbData[];
};
export default function MobileMenu({ crumbs }: Props) {
  const router = useRouter();
  if (crumbs.length === 0) {
    return <></>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-2">
        <MobileMenuIcon size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-fit">
        {crumbs.map((crumb, i) => (
          <div key={crumb.idpath.join(":")}>
            {i > 0 && <DropdownMenuSeparator key={`separator-${i}`} />}
            {crumb.siblings && (
              <DropdownMenuGroup>
                {crumb.siblings.map((sib) => {
                  const isCurrent = sib.idpath.join("/") === crumb.idpath.join("/");
                  return (
                    <DropdownMenuItem
                      key={sib.idpath.join(":")}
                      className={cn(
                        "py-3 text-md",
                        isCurrent ? "bg-accent" : "",
                      )}
                      onSelect={() =>
                        router.push(pieceUrl(sib.idpath))
                      }
                    >
                      {sib.name}
                      {isCurrent && <CheckMark className="ml-2" size={20} />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
