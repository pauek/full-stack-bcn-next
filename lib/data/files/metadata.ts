import { ContentPiece } from "@/lib/adt";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { DataBackend, DataBackendBase } from "../data-backend";
import { getPieceSlideList, pieceHasDoc } from "./backend";
import { log } from "console";

export const METADATA_FILENAME = ".meta.json";

const defaultMetadata = {
  numSlides: 0,
  hasDoc: false,
};

export const readMetadata = async (diskpath: string): Promise<any> => {
  try {
    const metadataPath = join(diskpath, METADATA_FILENAME);
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
  const metadataPath = join(dir, METADATA_FILENAME);
  await writeFile(metadataPath, json);
};

export const updateMetadata = async (diskpath: string, func: (metadata: any) => Promise<any>) => {
  const metadata = await readMetadata(diskpath);
  await func(metadata);
  await writeMetadata(diskpath, metadata);
};

type PieceStandardMetadata = {
  idjpath: string;
  index: number;
  numSlides: number;
  hasDoc: boolean;
};

type MetadataLogFunc = (metadata: PieceStandardMetadata) => void;

export const courseUpdateMetadata = async (
  backend: DataBackend,
  course: ContentPiece,
  logFunc?: MetadataLogFunc
) => {
  let currPartIndex = 1;
  let currSessionIndex = 1;
  await backend.walkContentPieces(course, async (piece, children) => {
    const level = piece.idpath.length - 1; // 1-part, 2-session, 3-chapter
    await updateMetadata(piece.diskpath, async (metadata: any) => {
      // hasDoc
      metadata.hasDoc = await pieceHasDoc(piece);

      // numSlides
      const slides = await getPieceSlideList(piece);
      metadata.numSlides = slides ? slides.length : 0;

      // index
      if (level === 1) {
        metadata.index = currPartIndex;
        currPartIndex++;
      } else if (level === 2) {
        // index (for sessions), we assume that the walk is *ordered by filenames*
        metadata.index = currSessionIndex;
        currSessionIndex++;
      } else {
        // walkContentPieces might set the index (the child index), so we copy it here.
        metadata.index = piece.metadata.index;
      }

      if (logFunc) {
        logFunc({ idjpath: piece.idpath.join("/"), ...metadata });
      }
    });
  });
};
