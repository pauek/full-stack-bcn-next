import ChapterCard from "@/components/ChapterCard";
import StaticLayout from "@/components/StaticLayout";
import { getAllSessionPaths, getSession } from "@/lib/files/files";

export async function generateStaticParams() {
	const sessionPaths = await getAllSessionPaths(process.env.COURSE!);
	return sessionPaths.map((path) => ({ params: path }));
}

type PageProps = {
	params: {
		partId: string;
		sessionId: string;
	};
};
export default async function Page({ params }: PageProps) {
    const courseId = process.env.COURSE!;
	const { partId, sessionId } = params;
	const session = await getSession([courseId, partId, sessionId]);
	if (session === null) {
		throw `Session with path ${[courseId, partId, sessionId]} not found`;
	}
	return (
		<StaticLayout path={[courseId, partId, sessionId]}>
			<div className="max-w-[54em] m-auto pb-6">
				<div className="mx-4">
					<div id="top" className="absolute top-0" />
					<h2 className="pt-8 pb-6">{session.name}</h2>
					<div className="gap-4 grid lg:grid-cols-2 max-md:grid-cols-1">
						{session.chapters.map((chapter) => (
							<ChapterCard key={chapter.id} path={[chapter.id, partId, sessionId]} chapter={chapter} />
						))}
					</div>
				</div>
			</div>
		</StaticLayout>
	);
}
