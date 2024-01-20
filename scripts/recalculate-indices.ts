import { getSessionSequence, updateMetadata } from "@/lib/data/files/files";

const diskpaths = await getSessionSequence(process.env.COURSE!);
for (let i = 0; i < diskpaths.length; i++) {
  await updateMetadata(diskpaths[i], (metadata) => {
    metadata.index = i + 1;
  });
}
