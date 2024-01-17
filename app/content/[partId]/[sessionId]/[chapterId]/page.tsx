import ChapterContent from "@/components/ChapterContent";
import ChapterDocument from "@/components/ChapterDocument";
import SlideGrid from "@/components/ChapterSlideGrid";
import StaticLayout from "@/components/StaticLayout";
import { generateAllChapterPaths, getChapter, getChapterSlideList } from "@/lib/files/files";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
	const chapterPaths = await generateAllChapterPaths(process.env.COURSE!);
	return chapterPaths.map((p) => ({ params: p }));
}

export default async function Page({ params }: any) {
	const courseId = process.env.COURSE!;

	const { partId, sessionId, chapterId } = params;
	const path = [courseId, partId, sessionId, chapterId];

	const chapter = await getChapter(path);
	if (chapter === null) {
		notFound();
	}

	const slides = await getChapterSlideList(chapter);

	let options = [];
	if (chapter.hasDoc) {
		options.push({
			name: "Document",
			component: <ChapterDocument path={path} />,
		});
	}
	if (chapter.numSlides > 0) {
		options.push({
			name: "Slides",
			component: <SlideGrid path={path} slides={slides} />,
		});
	}

	return (
		<StaticLayout path={path}>
			<ChapterContent chapter={chapter} options={options} />
		</StaticLayout>
	);
}
