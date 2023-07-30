type Base = {
  id: string;
  name: string;
};

export type Chapter = Base & { hasDoc: boolean; numSlides: number };
export type Session = Base & { chapters: Chapter[] };
export type Part = Base & { sessions: Session[] };
export type Course = Base & { parts: Part[] };

const _url = (...path: string[]) =>
  `${process.env.CONTENT_SERVER}/${path.join("/")}`;

const _getJson = async (...path: string[]) => {
  const url = _url(...path);
  const response = await fetch(url);
  return await response.json();
};
const _getText = async (...path: string[]) => {
  const response = await fetch(_url(...path));
  return await response.text();
};

export const getCourseList = async () => _getJson();

export async function getContentItem<T>(...path: string[]): Promise<T> {
  return _getJson(...path);
}

export const getCourse = getContentItem<Course>;
export const getPart = getContentItem<Part>;
export const getSession = getContentItem<Session>;
export const getChapter = getContentItem<Chapter>;

export const getChapterDoc = async (path: string[]) => _getText(...path, "doc");

export const getSlidesList = async (path: string[]) =>
  _getJson(...path, "slides");

export const generateAllSessionParams = async () => {
  const result = [];
  const { parts } = await getCourse();
  for (const part of parts) {
    const { sessions } = await getPart(part.id);
    for (const session of sessions) {
      result.push({ params: { partId: part.id, sessionId: session.id } });
    }
  }
  return result;
};

export const generateAllChapterParams = async () => {
  const result = [];
  const { parts } = await getCourse();
  for (const part of parts) {
    const { sessions } = await getPart(part.id);
    for (const session of sessions) {
      const { chapters } = await getSession(part.id, session.id);
      if (chapters) {
        for (const chapter of chapters) {
          result.push({
            params: {
              partId: part.id,
              sessionId: session.id,
              chapterId: chapter.id,
            },
          });
        }
      }
    }
  }
  return result;
};

export type CrumbData = {
  name: string;
  path: string[];
  siblings?: Array<CrumbData>;
};

export const getBreadcrumbs = async (
  ...path: string[]
): Promise<CrumbData[]> => {
  const crumbs: CrumbData[] = [];
  let siblings: Array<any> = [];
  for (let i = 1; i <= path.length; i++) {
    const currPath = path.slice(0, i);
    const item = await getContentItem<any>(...currPath);
    crumbs.push({
      name: item.name,
      path: currPath,
      siblings: siblings.map(
        (s): CrumbData => ({
          name: s.name,
          path: [...currPath.slice(0, i - 1), s.id],
        })
      ),
    });
    switch (i) {
      case 1:
        siblings = item.sessions;
        break;
      case 2:
        siblings = item.chapters;
        break;
    }
  }
  return crumbs;
};
