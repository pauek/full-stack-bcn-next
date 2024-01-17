"use client";

import type { Chapter } from "@/lib/adt";
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
			className={"p-0 " + (isActive ? "border-b-2 border-black text-black" : "text-stone-500")}
			onClick={() => setSelected(pos)}
		>
			<div className="m-1 p-1 px-2 hover:bg-stone-100 rounded transition-color text-sm">{text}</div>
		</div>
	);

	return (
		<>
			<div className="bg-white border-b">
				<div className="max-w-[54em] pt-8 m-auto">
					<div className="mx-4">
						<h1 className="font-light mb-2 text-4xl">{chapter.name}</h1>
						<div className="flex flex-row cursor-pointer">
							{options.map((option, i) => (
								<Option key={option.name} pos={i} text={option.name} isActive={i == selected} />
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
