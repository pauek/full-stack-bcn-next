export type ContentPiece = {
    type: "chapter" | "session" | "part" | "course";
	id: string;
	name: string;
	path: string;
	children?: ContentPiece[];
};

export type Chapter = ContentPiece & { type: "chapter"; hasDoc: boolean; numSlides: number };
export type Session = ContentPiece & { type: "session" };
export type Part = ContentPiece & { type: "part" };
export type Course = ContentPiece & { type: "course" };
