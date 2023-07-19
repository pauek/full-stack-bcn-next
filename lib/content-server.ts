const { CONTENT_SERVER } = process.env;

type Base = {
  id: string;
  name: string;
};

export type Chapter = Base;
export type Session = Base & { chapters: Chapter[] };
export type Part = Base & { sessions: Session[] };
export type Course = Base & { parts: Part[] };

export async function getContentItem<T = Base>(id: string[]): Promise<T> {
  const response = await fetch(`${CONTENT_SERVER}/${id.join("/")}`);
  return await response.json();
}

export const getCourse = getContentItem<Course>;
export const getPart = getContentItem<Part>;
export const getSession = getContentItem<Session>;
export const getChapter = getContentItem<Chapter>;

export const getChapterDoc = async (id: string[]) => {
  const response = await fetch(`${CONTENT_SERVER}/${id.join("/")}/doc`);
  return await response.text();
};

export const getCourseList = async () => {
  const response = await fetch(`${CONTENT_SERVER}/`);
  return await response.json();
}