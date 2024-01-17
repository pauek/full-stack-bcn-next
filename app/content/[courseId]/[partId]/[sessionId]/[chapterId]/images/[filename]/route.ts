import { getChapter } from "@/lib/files/files";
import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const mimeType: Record<string, string> = {
	svg: "image/svg+xml",
	jpg: "image/jpeg",
	png: "image/png",
};

export async function GET(req: NextRequest) {
	const [_empty, _content, ...path] = req.nextUrl.pathname.split("/");
	const chapter = await getChapter(path);
	if (!chapter) {
		notFound();
	}
	const [imageFilenameURL] = path.slice(-1);
	const imageFilename = decodeURIComponent(imageFilenameURL);
    const imageExtension = imageFilename.split(".").slice(-1)[0];
	const imagePath = `${chapter.path}/images/${imageFilename}`;
	const imageBytes = await readFile(imagePath);
	return new NextResponse(imageBytes.buffer, {
		headers: {
			"Content-Type": mimeType[imageExtension] ?? "image/*",
		},
	});
}
