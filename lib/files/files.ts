import { Chapter, Course, Part, Session } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import * as utils from "./utils";

const METADATA_FILENAME = ".meta.json";

const _readMetadata = async (dir: string) => {
	try {
		const metadataPath = join(dir, METADATA_FILENAME);
		const bytes = await readFile(metadataPath);
		return JSON.parse(bytes.toString());
	} catch (e) {
		return {};
	}
};

const { CONTENT_ROOT } = process.env;

export const getCourse = async (courseId: string): Promise<Course | null> => {
	if (!CONTENT_ROOT) {
		throw "No content root!";
	}
	const path = `${CONTENT_ROOT}/${courseId}`;
	const metadata = await _readMetadata(path);
	const course = { path, ...metadata };
	const parts = await getCourseParts(course.path);
	return {
		id: course.id,
		path: course.path,
		name: course.name,
		parts,
	};
};

export const getCourseParts = async (coursePath: string) => {
	const parts = [];
	for (const ent of await utils.readDirWithFileTypes(coursePath)) {
		if (utils.isContentEntity(ent)) {
			const path = join(coursePath, ent.name);
			const metadata = await _readMetadata(path);
			parts.push({
				path,
				name: utils.dirNameToTitle(ent.name),
				...metadata,
			});
		}
	}
	return parts;
};

export const getPartSessions = async (partPath: string) => {
	const sessions = [];
	for (const ent of await utils.readDirWithFileTypes(partPath)) {
		if (utils.isContentEntity(ent)) {
			const path = join(partPath, ent.name);
			const metadata = await _readMetadata(path);
			sessions.push({
				path,
				name: utils.dirNameToTitle(ent.name),
				...metadata,
			});
		}
	}
	return sessions;
};

export const getPart = async (path: string[]): Promise<Part | null> => {
	const [courseId, partId] = path;
	const course = await getCourse(courseId);
	if (!course) {
		return null;
	}
	const part = course.parts.find((part) => part.id === partId);
	if (!part) {
		return null;
	}
	return {
		id: part.id,
		path: part.path,
		name: part.name,
		sessions: await getPartSessions(part.path),
	};
};

export const getSessionChapters = async (sessionPath: string) => {
	const chapters = [];
	for (const ent of await utils.readDirWithFileTypes(sessionPath)) {
		if (utils.isContentEntity(ent)) {
			const path = join(sessionPath, ent.name);
			const metadata = await _readMetadata(path);
			chapters.push({
				path,
				name: utils.dirNameToTitle(ent.name),
				...metadata,
			});
		}
	}
	return chapters;
};

export const getSession = async (path: string[]): Promise<Session | null> => {
	const [courseId, partId, sessionId] = path;
	const part = await getPart([courseId, partId]);
	if (!part) {
		return null;
	}
	const session = part.sessions.find((session) => session.id === sessionId);
	if (!session) {
		return null;
	}
	return {
		id: session.id,
		path: session.path,
		name: session.name,
		chapters: await getSessionChapters(session.path),
	};
};

export const getChapter = async (path: string[]): Promise<Chapter | null> => {
	const [courseId, partId, sessionId, chapterId] = path;

	const session = await getSession([courseId, partId, sessionId]);
	if (!session) {
		return null;
	}
	const chapter = session.chapters.find((chapter) => chapter.id === chapterId);
	if (!chapter) {
		return null;
	}
	chapter.hasDoc = (await getDoc(chapter)) != null;
	let slides = await getChapterSlideList(chapter);
	chapter.numSlides = slides ? slides.length : 0;
	return chapter;
};

export const getDoc = async (chapter: Chapter) => {
	for (const ent of await utils.readDirWithFileTypes(chapter.path)) {
		if (ent.isFile() && ent.name.startsWith("doc.")) {
			return ent.name;
		}
	}
	return null;
};

export const getChapterDoc = async (path: string[]) => {
	const chapter = await getChapter(path);
	if (!chapter) {
		return null;
	}
	try {
		let doc = await getDoc(chapter);
		return doc ? readFile(join(chapter.path, doc)) : null;
	} catch (e) {
		return null;
	}
};

export const getChapterImage = async (path: string[], imgName: string): Promise<Buffer | null> => {
	const chapter = await getChapter(path);
	if (!chapter) {
		return null;
	}
	const imgPath = join(chapter.path, "images", imgName);
	try {
		return readFile(imgPath);
	} catch (e) {
		return null;
	}
};

type FilePredicate = (ent: Dirent) => boolean;

export const getChapterSubdirList = async (
	chapter: Chapter,
	subdir: string,
	filePred: FilePredicate
): Promise<Array<string> | null> => {
	try {
		const dirpath = join(chapter.path, subdir);
		const files: string[] = [];
		for (const ent of await readdir(dirpath, { withFileTypes: true })) {
			if (filePred(ent)) {
				files.push(ent.name);
			}
		}
		return files;
	} catch (e) {
		return null;
	}
};

export const getChapterSlideList = async (chapter: Chapter) =>
	getChapterSubdirList(chapter, "slides", utils.isSlide);

export const getChapterImageList = async (chapter: Chapter) =>
	getChapterSubdirList(chapter, "images", utils.isImage);

export const getChapterSlide = async (path: string[], imgName: string): Promise<Buffer | null> => {
	const chapter = await getChapter(path);
	if (!chapter) {
		return null;
	}
	const slides = join(chapter.path, "slides");
	return readFile(join(slides, imgName));
};

export const getAllFilePaths = async (courseId: string, subdir: string, extensions: string[]) => {
	const filePaths = [];

	const isMatch = (filename: string) => {
		for (const ext of extensions) {
			if (filename.endsWith(ext)) {
				return true;
			}
		}
		return false;
	};

	const course = await getCourse(courseId);
	if (course === null) {
		console.error(`Course "fullstack" not found!?!`);
		return;
	}
	for (const { id: partId } of course.parts) {
		const part = await getPart([courseId, partId]);
		if (part === null) {
			console.error(`Part "${[partId].join("/")}" not found!?!`);
			continue;
		}
		for (const { id: sessionId } of part.sessions) {
			const session = await getSession([courseId, partId, sessionId]);
			if (session === null) {
				console.error(`Session "${[courseId, partId, sessionId].join("/")}" not found!?!`);
				continue;
			}
			for (const { id: chapterId } of session.chapters) {
				const chapter = await getChapter([courseId, partId, sessionId, chapterId]);
				if (chapter === null) {
					console.error(
						`Chapter "${[courseId, partId, sessionId, chapterId].join("/")}" not found!?!`
					);
					continue;
				}
				const imageDir = join(chapter.path, subdir);
				try {
					for (const ent of await utils.readDirWithFileTypes(imageDir)) {
						if (ent.isFile() && isMatch(ent.name)) {
							filePaths.push(join(courseId, partId, sessionId, chapterId, subdir, ent.name));
						}
					}
				} catch (e) {
					// If directory doesn't exist, do nothing...
				}
			}
		}
	}
	return filePaths;
};

export type CrumbData = {
	name: string;
	path: string[];
	siblings?: Array<CrumbData>;
};

export const getBreadcrumbs = async (...path: string[]): Promise<CrumbData[]> => {
	const crumbs: CrumbData[] = [];
	let siblings: Array<CrumbData> = [];

	const [courseId, partId, sessionId, chapterId] = path;
	if (partId) {
		const part = await getPart([courseId, partId]);
		if (!part) return [];
		crumbs.push({ name: part.name, path: [partId] });
		siblings = part.sessions.map((s) => ({
			name: s.name,
			path: [partId, s.id],
		}));
		if (sessionId) {
			const session = await getSession([courseId, partId, sessionId]);
			if (!session) return [];
			crumbs.push({
				name: session.name,
				path: [courseId, partId, sessionId],
				siblings,
			});
			siblings = session.chapters.map((ch) => ({
				name: ch.name,
				path: [courseId, partId, sessionId, ch.id],
			}));
			if (chapterId) {
				const chapter = await getChapter([courseId, partId, sessionId, chapterId]);
				if (!chapter) return [];
				crumbs.push({
					name: chapter.name,
					path: [courseId, partId, sessionId, chapterId],
					siblings,
				});
			}
		}
	}
	return crumbs;
};

export const getAllSessionPaths = async (courseId: string) => {
	const sessionPaths = [];
	const course = await getCourse(courseId);
	if (course === null) {
		return [];
	}
	for (const part of course.parts) {
		for (const session of await getPartSessions(part.path)) {
			sessionPaths.push({
				partId: part.id,
				sessionId: session.id,
			});
		}
	}
	return sessionPaths;
};

export const generateAllChapterPaths = async (courseId: string) => {
	const course = await getCourse(courseId);
	if (course === null) {
		return [];
	}
	const result = [];
	for (const _part of course.parts) {
		const part = await getPart([courseId, _part.id]);
		if (part == null) {
			continue;
		}
		for (const _session of part.sessions) {
			const session = await getSession([courseId, _part.id, _session.id]);
			if (session === null) {
				continue;
			}
			for (const _chapter of session.chapters) {
				result.push([courseId, part.id, session.id, _chapter.id]);
			}
		}
	}
	return result;
};

export const generateAllChapterParams = async (courseId: string) => {
	const paths = await generateAllChapterPaths(courseId);
	return paths.map((path) => ({
		courseId: path[0],
		partId: path[1],
		sessionId: path[2],
		chapterId: path[3],
	}));
};
