type Base = {
	id: string;
	name: string;
	path: string;
};

export type Chapter = Base & { hasDoc: boolean; numSlides: number };
export type Session = Base & { chapters: Chapter[] };
export type Part = Base & { sessions: Session[] };
export type Course = Base & { parts: Part[] };
