"use client";

import { useState } from "react";

type Props = {
  options: {
    name: string;
    component: React.ReactNode;
  }[];
};
export default function ChapterMenu({ options }: Props) {
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
      <div
        className={
          "fixed z-10 top-12 left-0 right-0 bg-white cursor-pointer " +
          "border-b text-sm flex flex-row gap-5 pl-5 shadow-sm"
        }
      >
        {options.map((option, i) => (
          <Option
            pos={i}
            key={option.name}
            text={option.name}
            isActive={i == selected}
          />
        ))}
      </div>
      <div className="pt-12">
        {options.map((option, i) => (
          <div key={option.name} className={i == selected ? `block` : `hidden`}>
            {option.component}
          </div>
        ))}
      </div>
    </>
  );
}
