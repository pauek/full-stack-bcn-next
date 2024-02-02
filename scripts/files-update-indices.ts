import { filesBackend } from "@/lib/data";
import { getSessionSequence, updateMetadata } from "@/lib/data/files";

const sessions = await getSessionSequence(process.env.COURSE_ID!);
for (let i = 0; i < sessions.length; i++) {
  // Sessions have an index with respect to the course (not parts)
  await updateMetadata(sessions[i].diskpath, async (metadata) => {
    const index = i + 1;
    console.log(`${index.toString().padStart(3)} - ${sessions[i].idpath.join("/")}`);
    metadata.index = index;
  });

  // Chapters have an index with respect to the session
  const { idpath } = sessions[i];
  const session = await filesBackend.getPieceWithChildren(idpath);
  if (!session) {
    throw `Session "${idpath.join("/")}" not found!`;
  }
  if (session.children) {
    for (let j = 0; j < session.children.length; j++) {
      const child = session.children[j];
      await updateMetadata(child.diskpath, async (metadata) => {
        metadata.index = j + 1;
      });
    }
  }
}
