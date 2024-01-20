import { readFile, writeFile } from "fs/promises";
import { join as pathJoin } from "path";

const __METADATA_FILENAME = ".meta.json";

export const readMetadata = async (diskpath: string): Promise<any> => {
  try {
    const metadataPath = pathJoin(diskpath, __METADATA_FILENAME);
    const bytes = await readFile(metadataPath);
    return JSON.parse(bytes.toString());
  } catch (e) {
    return {};
  }
};

const writeMetadata = async (dir: string, metadata: any) => {
  const json = JSON.stringify(metadata, null, 2);
  const metadataPath = pathJoin(dir, __METADATA_FILENAME);
  await writeFile(metadataPath, json);
};

export const updateMetadata = async (
  diskpath: string,
  func: (metadata: any) => any
) => {
  const metadata = await readMetadata(diskpath);
  func(metadata);
  await writeMetadata(diskpath, metadata);
};
