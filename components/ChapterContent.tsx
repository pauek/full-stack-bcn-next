"use client";

import type { ContentPiece } from "@/lib/adt";
import { cn } from "@/lib/utils";
import { useState } from "react";

type OptionData = {
  name: string;
  component: React.ReactNode;
};

type OptionProps = {
  pos: number;
  isActive: boolean;
  text: string;
};

type Props = {
  chapter: ContentPiece;
  options: OptionData[];
};
export default function ChapterContent({ chapter, options }: Props) {
  const [selected, setSelected] = useState(0);

  const ChapterHeader = ({ name, options }: { name: string; options: OptionData[] }) => (
    <div className="mx-4">
      <h1 className="font-light mb-2 text-4xl">{name}</h1>
      <div className="flex flex-row gap-2 cursor-pointer">
        {options.map(({ name }, i) => (
          <Option key={name} pos={i} text={name} isActive={i == selected} />
        ))}
      </div>
    </div>
  );

  const Option = ({ pos, isActive, text }: OptionProps) => (
    <div
      className={cn("p-0 ", isActive ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground")}
      onClick={() => setSelected(pos)}
    >
      <div className="m-1 p-1 px-2 hover:bg-muted rounded transition-color text-sm">{text}</div>
    </div>
  );

  return (
    <>
      <div className="w-full bg-background border-b">
        <div className="max-w-[54em] pt-8 m-auto">
          <ChapterHeader name={chapter.name} options={options} />
        </div>
      </div>
      <div className="w-full pb-2 max-w-[54em]">
        {options.map((option, i) => (
          <div key={option.name} className={i == selected ? `block` : `hidden`}>
            {option.component}
          </div>
        ))}
      </div>
    </>
  );
}
