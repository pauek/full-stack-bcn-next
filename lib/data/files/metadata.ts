import { ContentPieceMetadata } from "@/lib/adt";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

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
