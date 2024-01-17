export type ContentPiece = {
	id: string;
	name: string;
	path: string;
};

export type Chapter = ContentPiece & { hasDoc: boolean; numSlides: number };
export type Session = ContentPiece & { children: Chapter[] };
export type Part = ContentPiece & { children: Session[] };
export type Course = ContentPiece & { children: Part[] };
