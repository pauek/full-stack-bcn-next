import { ContentPiece } from "@/lib/adt";
import { filesBackend } from "@/lib/data";
import { getSessionSequence, updateMetadata } from "@/lib/data/files";

const updateSessionChildren = async (session: ContentPiece) => {
  // Chapters have an index with respect to the session
  const { idpath } = session;
  const sessionFull = await filesBackend.getPieceWithChildren(idpath);
  if (!sessionFull) {
    throw `Session "${idpath.join("/")}" not found!`;
  }
  if (!sessionFull.children) {
    return;
  }
  for (let j = 0; j < sessionFull.children.length; j++) {
    const child = sessionFull.children[j];
    await updateMetadata(child.diskpath, async (metadata) => {
      metadata.index = j + 1;
    });
  }
};

const updateSession = async (session: ContentPiece, index: number) => {
  // Sessions have an index with respect to the course (not parts)
  await updateMetadata(session.diskpath, async (metadata) => {
    console.log(`${index.toString().padStart(3)} - ${session.idpath.join("/")}`);
    metadata.index = index;
  });
};

const sessions = await getSessionSequence(process.env.COURSE_ID!);
for (let i = 0; i < sessions.length; i++) {
  const session = sessions[i];
  await updateSession(session, i + 1);
  await updateSessionChildren(session);
}
