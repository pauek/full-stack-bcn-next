import { getCourse, getPart, getSession } from "files";

export const generateAllChapterPaths = async () => {
	const course = await getCourse();
	if (course === null) {
		return [];
	}
	const result = [];
	for (const _part of course.parts) {
		const part = await getPart([_part.id]);
		if (part == null) {
			continue;
		}
		for (const _session of part.sessions) {
			const session = await getSession([_part.id, _session.id]);
			if (session === null) {
				continue;
			}
			for (const _chapter of session.chapters) {
				result.push([part.id, session.id, _chapter.id]);
			}
		}
	}
	return result;
};

export const generateAllChapterParams = async () => {
	const paths = await generateAllChapterPaths();
	return paths.map((path) => ({
		partId: path[0],
		sessionId: path[1],
		chapterId: path[2],
	}));
};
