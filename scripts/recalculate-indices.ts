import {
  enumerateSessions,
  readMetadata,
  writeMetadata,
} from "@/lib/files/files";

const updateIndex = async (diskpath: string, index: number) => {
  const metadata = await readMetadata(diskpath);
  metadata.index = index;
  await writeMetadata(diskpath, metadata);
};

const courseId = process.env.COURSE!;
const diskpaths = await enumerateSessions(courseId);

for (let i = 0; i < diskpaths.length; i++) {
  updateIndex(diskpaths[i], i+1);
}
