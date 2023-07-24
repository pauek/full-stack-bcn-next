const { CONTENT_SERVER } = process.env;

type Base = {
  id: string;
  name: string;
};

export type Chapter = Base;
export type Session = Base & { chapters: Chapter[] };
export type Part = Base & { sessions: Session[] };
export type Course = Base & { parts: Part[] };

const _url = (path: string[]) => `${CONTENT_SERVER}/${path.join("/")}`;

const _getJson = async (path: string[] = []) => {
  const response = await fetch(_url(path));
  return await response.json();
};
const _getText = async (path: string[] = []) => {
  const response = await fetch(_url(path));
  return await response.text();
}

export const getCourseList = async () => _getJson();

export async function getContentItem<T>(path: string[] = []): Promise<T> {
  return _getJson(path);
}

export const getCourse = getContentItem<Course>;
export const getPart = getContentItem<Part>;
export const getSession = getContentItem<Session>;
export const getChapter = getContentItem<Chapter>;

export const getChapterDoc = async (path: string[]) => _getText([...path, "doc"]);

export const getSlidesList = async (path: string[]) =>
  _getJson([...path, "slides"]);
