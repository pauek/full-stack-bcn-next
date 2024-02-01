import { getSessionSequence, updateMetadata } from "@/lib/data/files";

const sessions = await getSessionSequence(process.env.COURSE_ID!);
for (let i = 0; i < sessions.length; i++) {
  await updateMetadata(sessions[i].diskpath, async (metadata) => {
    const index = i + 1;
    console.log(`${index.toString().padStart(3)} - ${sessions[i].idpath.join("/")}`);
    metadata.index = index;
  });
}
