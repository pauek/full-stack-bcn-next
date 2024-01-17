import { readFile, readdir } from "fs/promises";
import { join } from "path";
import * as utils from "./utils.ts";
import { Dirent } from "fs";
import { Chapter, Course, Part, Session } from "adt/types.js";

const METADATA_FILENAME = ".meta.json";

const _readMetadata = async (dir: string) => {
	const metadataPath = join(dir, METADATA_FILENAME);
	const bytes = await readFile(metadataPath);
	return JSON.parse(bytes.toString());
};

const { CONTENT_ROOT } = process.env;

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

export const getCourse = async (): Promise<Course | null> => {
	if (!CONTENT_ROOT) {
		throw "No content root!";
	}
	const metadata = await _readMetadata(CONTENT_ROOT);
	const course = { path: CONTENT_ROOT, ...metadata };
	const parts = await getCourseParts(course.path);
	return {
		id: course.id,
		path: course.path,
		name: course.name,
		parts,
	};
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
	const [partId] = path;
	const course = await getCourse();
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
	const [partId, sessionId] = path;
	const part = await getPart([partId]);
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
	const [partId, sessionId, chapterId] = path;

	const session = await getSession([partId, sessionId]);
	if (!session) {
		return null;
	}
	const chapter = session.chapters.find((chapter) => chapter.id === chapterId);
	if (!chapter) {
		return null;
	}
	chapter.hasDoc = (await _findDoc(chapter)) != null;
	let slides = await getChapterSlideList(chapter);
	chapter.numSlides = slides ? slides.length : 0;
	return chapter;
};

const _findDoc = async (chapter: Chapter) => {
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
		let doc = await _findDoc(chapter);
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

export type FilePredicate = (ent: Dirent) => boolean;

export type FileInfo = {
	name: string;
	fullpath: string;
};

export const getChapterSubdirList = async (
	chapter: Chapter,
	subdir: string,
	filePred: FilePredicate
): Promise<Array<FileInfo> | null> => {
	try {
		const dirpath = join(chapter.path, subdir);
		const files: FileInfo[] = [];
		for (const ent of await readdir(dirpath, { withFileTypes: true })) {
			if (filePred(ent)) {
				files.push({ fullpath: join(dirpath, ent.name), name: ent.name });
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

export const getAllFilePaths = async (subdir: string, extensions: string[]) => {
	const filePaths = [];

	const isMatch = (filename: string) => {
		for (const ext of extensions) {
			if (filename.endsWith(ext)) {
				return true;
			}
		}
		return false;
	};

	const course = await getCourse();
	if (course === null) {
		console.error(`Course "fullstack" not found!?!`);
		return;
	}
	for (const { id: partId } of course.parts) {
		const part = await getPart([partId]);
		if (part === null) {
			console.error(`Part "${[partId].join("/")}" not found!?!`);
			continue;
		}
		for (const { id: sessionId } of part.sessions) {
			const session = await getSession([partId, sessionId]);
			if (session === null) {
				console.error(`Session "${[partId, sessionId].join("/")}" not found!?!`);
				continue;
			}
			for (const { id: chapterId } of session.chapters) {
				const chapter = await getChapter([partId, sessionId, chapterId]);
				if (chapter === null) {
					console.error(`Chapter "${[partId, sessionId, chapterId].join("/")}" not found!?!`);
					continue;
				}
				const imageDir = join(chapter.path, subdir);
				try {
					for (const ent of await utils.readDirWithFileTypes(imageDir)) {
						if (ent.isFile() && isMatch(ent.name)) {
							filePaths.push(join(partId, sessionId, chapterId, subdir, ent.name));
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

	const [partId, sessionId, chapterId] = path;
	if (partId) {
		const part = await getPart([partId]);
		if (!part) return [];
		crumbs.push({ name: part.name, path: [partId] });
		siblings = part.sessions.map((s) => ({
			name: s.name,
			path: [partId, s.id],
		}));
		if (sessionId) {
			const session = await getSession([partId, sessionId]);
			if (!session) return [];
			crumbs.push({
				name: session.name,
				path: [partId, sessionId],
				siblings,
			});
			siblings = session.chapters.map((ch) => ({
				name: ch.name,
				path: [partId, sessionId, ch.id],
			}));
			if (chapterId) {
				const chapter = await getChapter([partId, sessionId, chapterId]);
				if (!chapter) return [];
				crumbs.push({
					name: chapter.name,
					path: [partId, sessionId, chapterId],
					siblings,
				});
			}
		}
	}
	return crumbs;
};

export const getAllSessionPaths = async () => {
	const sessionPaths = [];
	const { parts } = (await getCourse()) as Course;
	for (const part of parts) {
		const { sessions } = (await getPart([part.id])) as Part;
		for (const session of sessions) {
			sessionPaths.push({
				partId: part.id,
				sessionId: session.id,
			});
		}
	}
	return sessionPaths;
};

