import { NextResponse } from "next/server";
import { fileExtension } from "../../files/utils";
import { type Chapter } from "adt/types";

import * as files from "files";
import type { FileInfo } from "files";

export const NotFound = () => new NextResponse("Not Found", { status: 404 });

export const JSON = (x: any) => NextResponse.json(x);

export const BytesWithMime = (bytes: Buffer, mimeType: string) => {
	return new NextResponse(bytes, {
		status: 200,
		headers: { "Content-Type": mimeType },
	});
};

export const TextDocument = (bytes: Buffer) => BytesWithMime(bytes, "text/plain;charset=UTF-8");

const extensionToMimeType: Record<string, string> = {
	svg: "image/svg+xml",
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
};

export const Image = (bytes: Buffer, filename: string) => {
	const ext = fileExtension(filename);
	return BytesWithMime(bytes, extensionToMimeType[ext]);
};

export const respond = async (path: string[], func: (path: string[]) => any) => {
	const entity = await func(path);
	return entity ? JSON(entity) : NotFound();
};

export const respondDoc = async (path: string[]) => {
	const bytes = await files.getChapterDoc(path);
	return bytes ? TextDocument(bytes) : NotFound();
};

export const respondImage = async (path: string[], filename: string) => {
	const bytes = await files.getChapterImage(path, filename);
	return bytes ? Image(bytes, filename) : NotFound();
};

type GetListFunc = (c: Chapter) => Promise<Array<FileInfo> | null>;
const respondList = async (path: string[], func: GetListFunc) => {
	try {
		const chapter = await files.getChapter(path);
		let list: FileInfo[] | null = null;
		if (chapter) {
			list = await func(chapter);
			return JSON(list);
		} else {
			return NotFound();
		}
	} catch (e) {
		return JSON(null);
	}
};

export const respondSlideList = async (...path: string[]) => respondList(path, files.getChapterSlideList);

export const respondImageList = async (...path: string[]) => respondList(path, files.getChapterImageList);

export const respondSlide = async (path: string[], filename: string) => {
	try {
		const bytes = await files.getChapterSlide(path, filename);
		return bytes ? Image(bytes, filename) : NotFound();
	} catch (e) {
		return NotFound();
	}
};
