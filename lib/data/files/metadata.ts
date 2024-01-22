import { ContentPiece, ContentPieceMetadata } from "@/lib/adt";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { getPiece, getPieceSlideList, pieceHasDoc, walkContentPiecesGeneric } from "./backend";

const __METADATA_FILENAME = ".meta.json";

const defaultMetadata: ContentPieceMetadata = {
  numSlides: 0,
  hasDoc: false,
  index: -1,
};

export const readMetadata = async (diskpath: string): Promise<any> => {
  try {
    const metadataPath = join(diskpath, __METADATA_FILENAME);
    const bytes = await readFile(metadataPath);
    const fileMetadata = JSON.parse(bytes.toString());
    return { ...defaultMetadata, ...fileMetadata };
  } catch (e) {
    console.warn(`Warning: error reading metadata for ${diskpath}: ${e}`);
    return {};
  }
};

const writeMetadata = async (dir: string, metadata: any) => {
  const json = JSON.stringify(metadata, null, 2);
  const metadataPath = join(dir, __METADATA_FILENAME);
  await writeFile(metadataPath, json);
};

export const updateMetadata = async (diskpath: string, func: (metadata: any) => Promise<any>) => {
  const metadata = await readMetadata(diskpath);
  await func(metadata);
  await writeMetadata(diskpath, metadata);
};

export const courseUpdateMetadata = async (course: ContentPiece) => {
  let currSessionIndex = 1;
  await walkContentPiecesGeneric<void>(course, async (piece) => {
    const level = piece.idpath.length - 1; // 1-part, 2-session, 3-chapter
    await updateMetadata(piece.diskpath, async (metadata: any) => {
      // hasDoc
      metadata.hasDoc = await pieceHasDoc(piece);

      // numSlides
      const slides = await getPieceSlideList(piece);
      metadata.numSlides = slides ? slides.length : 0;

      // index
      if (level == 2) {
        // index (for sessions), we assume that the walk is *ordered by filenames*
        metadata.index = currSessionIndex;
        currSessionIndex++;
      } else {
        // walkContentPieces sets the index to the child index
        metadata.index = piece.metadata.index;
      }
    });
  });
};
