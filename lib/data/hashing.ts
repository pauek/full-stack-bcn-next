import { ContentPiece } from "@/lib/adt";
import { DataBackend, DataBackendBase } from "./data-backend";
import { HashMapInfo } from "./hash-maps";
import { METADATA_FILENAME } from "./files/metadata";
import { basename } from "path";
import { readFile } from "fs/promises";
import crypto from "crypto";

export type Hash = string;

export interface AbstractContentPiece {
  files: string[];
  metadata: Record<string, string>;
  children: AbstractContentPiece;
}

export const hashAny = (x: any) => {
  const hasher = crypto.createHash("sha256");
  if (typeof x === "number") {
    hasher.update(`number(${x})`);
  } else if (typeof x === "string") {
    hasher.update(`string(${x})`);
  } else if (typeof x === "boolean") {
    hasher.update(`boolean(${x})`);
  } else if (Array.isArray(x)) {
    hasher.update(x.map((elem) => hashAny(elem)).join("\n"));
  } else if (x instanceof Buffer) {
    hasher.update(Buffer.from(x));
  } else if (typeof x === "object") {
    hasher.update(
      Object.entries(x)
        .map(([field, value]) => hashAny(`${field}=${value}\n`))
        .join("")
    );
  } else {
    throw `hash: Unsupported type ${typeof x}: ${JSON.stringify(x)}`;
  }
  return hasher.digest("hex");
};

export const hashFile = async (diskpath: string) => {
  return hashAny(await readFile(diskpath));
};

type HashItem = {
  name: string;
  hash: string;
};

export const hashPiece = async function (
  backend: DataBackendBase,
  piece: ContentPiece,
  children: HashItem[]
): Promise<HashItem> {
  children.sort((a, b) => a.name.localeCompare(b.name));
  const childrenHashes: HashItem[] = children.map(({ name, hash }) => ({ name, hash }));

  const hashes: HashItem[] = [];
  const fields = Object.entries(piece.metadata).sort(([a], [b]) => a.localeCompare(b));
  const strFields = JSON.stringify(fields);
  hashes.push({
    name: METADATA_FILENAME,
    hash: hashAny(strFields),
  });

  const doc = await backend.getPieceDocument(piece);
  if (doc !== null) {
    const { name, buffer } = doc;
    hashes.push({ name, hash: hashAny(buffer) });
  }

  const cover = await backend.getPieceCoverImageData(piece);
  if (cover !== null) {
    const { name, buffer } = cover;
    hashes.push({ name, hash: hashAny(buffer) });
  }

  const imgList = await backend.getPieceImageList(piece);
  if (imgList !== null) {
    for (const { name } of imgList) {
      hashes.push({
        name: `images/${name}`,
        hash: hashAny(await backend.getPieceFileData(piece, name, "image")),
      });
    }
  }

  const slideList = await backend.getPieceSlideList(piece);
  for (const { name } of slideList) {
    hashes.push({
      name: `slides/${name}`,
      hash: hashAny(await backend.getPieceFileData(piece, name, "slide")),
    });
  }

  hashes.sort((a, b) => {
    // first by name, then by hash
    const cmp1 = a.name.localeCompare(b.name);
    if (cmp1 != 0) return cmp1;
    const cmp2 = a.hash.localeCompare(b.hash);
    return cmp2;
  });

  const allHashes = [...childrenHashes, ...hashes];
  const allHashesAsText = allHashes.map(({ name, hash }) => `${hash} ${name}\n`).join("");

  return {
    name: basename(piece.diskpath),
    hash: hashAny(allHashesAsText),
  };
};

export const hashAllContent = async function (backend: DataBackend, root: ContentPiece) {
  const hashes: Map<string, HashMapInfo> = new Map();

  await backend.walkContentPieces(root, async (piece, children) => {
    const { hash, name } = await hashPiece(backend, piece, children);
    const idjpath = piece.idpath.join("/");
    hashes.set(idjpath, { hash, idjpath, diskpath: piece.diskpath });
    return { hash, name };
  });

  return hashes;
};
