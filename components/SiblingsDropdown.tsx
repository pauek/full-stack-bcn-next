"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import Link from "next/link";
import { pieceUrlPath } from "@/lib/urls";
import { ContentPiece } from "@/lib/adt";

type Props = {
  siblings: Array<ContentPiece>;
};

export default function SiblingsDropdown({ siblings }: Props) {
  return (
    <Collapsible className="flex flex-col items-end gap-1 ">
      <CollapsibleTrigger>
        <div
          className={
            "hover:bg-stone-200 hover:text-black p-1 rounded cursor-pointer"
          }
        >
          <CaretSortIcon className="text-stone-500" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="min-w-[10rem] bg-white rounded border px-2 py-1 flex flex-col shadow-md">
          {siblings.map((sib) => (
            <Link key={sib.name} className="p-1" href={pieceUrlPath(sib.idpath)}>
              {sib.name}
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
