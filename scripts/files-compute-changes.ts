import { ContentPiece } from "@/lib/adt";
import { filesBackend } from "@/lib/data";
import * as db from "@/lib/data/db";
import {
  HASH_FILE,
  courseUpdateMetadata,
  backend as files,
  readStoredHash,
} from "@/lib/data/files";
import { readHashMapFile, writeHashMapFile } from "@/lib/data/hash-maps";
import { hashPiece } from "@/lib/data/hashing";
import { removeNullElements } from "@/lib/utils";
import { writeFile } from "fs/promises";
import { join } from "path";

// Get the course (the root)
const getCourseRoot = async (): Promise<ContentPiece> => {
  const courseId = process.env.COURSE_ID!;
  const course = await files.getPiece([courseId]);
  if (!course) {
    throw `Course ${courseId} not found!`;
  }
  return course;
};

type Changes = {
  oldHash: string | null;
  newHash: string;
  diskpath: string;
  idpath: string[];
  childrenHashes: string[];
}[];

const getChangedPieces = async (course: ContentPiece): Promise<Changes> => {
  // Get the changed/new hashes
  const changes: Changes = [];

  await filesBackend.walkContentPieces(course, async (piece, children) => {
    const oldHash = await readStoredHash(piece.diskpath);
    const newHash = await hashPiece(files, piece, children);
    if (oldHash === null || oldHash !== newHash.hash) {
      changes.push({
        oldHash,
        newHash: newHash.hash,
        diskpath: piece.diskpath,
        idpath: piece.idpath,
        childrenHashes: children,
      });
    }
    return newHash;
  });
  return changes;
};

const writePieceStoredHashes = async (changes: Changes) => {
  for (const { diskpath, newHash } of changes) {
    await writeFile(join(diskpath, HASH_FILE), newHash);
  }
};

// Apply updates to the database
const applyChangesToDatabase = async (changes: Changes) => {
  for (const change of changes) {
    const piece = await files.getPiece(change.idpath);
    if (!piece) {
      console.error(`Error: now I don't find a piece that was there??`);
      continue;
    }
    console.log(change.newHash, change.idpath.join("/"));
    await db.insertPiece(piece);
    await db.insertFiles(piece);
    for (const childHash of change.childrenHashes) {
      await db.pieceSetParent(childHash, piece.hash);
    }
  }
};

const updateHashmapFile = async (changes: Changes) => {
  // Update hash map file
  const maps = await readHashMapFile();
  for (const change of changes) {
    let pos: number = maps.info.length;
    if (change.oldHash) {
      const index = maps.byHash.get(change.oldHash);
      if (!index) {
        throw Error(`Old hash index not found?!?`);
      }
      pos = index;
    }
    const idjpath = change.idpath.join("/");
    maps.info[pos] = {
      hash: change.newHash,
      diskpath: change.diskpath,
      idjpath,
    };
    maps.byHash.set(change.newHash, pos);
    maps.byPath.set(idjpath, pos);
  }

  // Save hash map file
  await writeHashMapFile(removeNullElements(maps.info));
  console.log("Updated hash map file");
};

const course = await getCourseRoot();
await courseUpdateMetadata(filesBackend, course);
const changes = await getChangedPieces(course);
if (changes.length > 0) {
  // await writePieceStoredHashes(changes);
  // await applyChangesToDatabase(changes);
  // await updateHashmapFile(changes);
  for (const change of changes) {
    console.log(change.newHash, change.idpath.join("/"));
  }
} else {
  console.log("No changes.");
}
