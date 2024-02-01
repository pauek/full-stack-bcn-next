import { getSessionSequence, updateMetadata } from "@/lib/data/files";

const diskpaths = await getSessionSequence(process.env.COURSE_ID!);
for (let i = 0; i < diskpaths.length; i++) {
  await updateMetadata(diskpaths[i], async (metadata) => {
    metadata.index = i + 1;
  });
}
