"use client";

import { Chapter } from "@/lib/content-server";
import { useState } from "react";

type Props = {
  chapter: Chapter;
  options: {
    name: string;
    component: React.ReactNode;
  }[];
};
export default function ChapterContent({ chapter, options }: Props) {
  const [selected, setSelected] = useState(0);

  type OptProps = {
    pos: number;
    isActive: boolean;
    text: string;
  };
  const Option = ({ pos, isActive, text }: OptProps) => (
    <div
      className={
        "py-2 " +
        (isActive ? "border-b-2 border-black text-black" : "text-stone-500")
      }
      onClick={() => setSelected(pos)}
    >
      {text}
    </div>
  );

  return (
    <>
      <div className="bg-white border-b">
        <div className="max-w-[54em] pt-8 m-auto">
          <div className="mx-4">
            <h1 className="font-light mb-2 text-4xl">{chapter.name}</h1>
            <div className="flex flex-row gap-5 cursor-pointer">
              {options.map((option, i) => (
                <Option
                  pos={i}
                  key={option.name}
                  text={option.name}
                  isActive={i == selected}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pb-2">
        {options.map((option, i) => (
          <div key={option.name} className={i == selected ? `block` : `hidden`}>
            {option.component}
          </div>
        ))}
      </div>
    </>
  );
}
