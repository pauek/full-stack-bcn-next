import { ContentPiece } from "@/lib/adt";
import { DataBackendBase } from "./data-backend";
import { HashMapInfo } from "./hash-maps";

export type Hash = string;

export interface AbstractContentPiece {
  files: string[];
  metadata: Record<string, string>;
  children: AbstractContentPiece;
}

export const hashAny = (x: any) => {
  const hasher = new Bun.CryptoHasher("sha256");
  if (typeof x === "number") {
    hasher.update(`number(${x})`);
  } else if (typeof x === "string") {
    hasher.update(`string(${x})`);
  } else if (typeof x === "boolean") {
    hasher.update(`boolean(${x})`);
  } else if (Array.isArray(x)) {
    hasher.update(x.map((elem) => hashAny(elem)).join("\n"));
  } else if (x instanceof Buffer) {
    hasher.update(x.buffer);
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

export const hashPiece = async function (
  backend: DataBackendBase,
  piece: ContentPiece,
  children: Hash[]
): Promise<Hash> {
  const hashes: { name: string; hash: string }[] = children.map((hash) => ({
    name: "",
    hash,
  }));

  for (const field in piece.metadata) {
    hashes.push({
      name: field,
      hash: hashAny(piece.metadata[field]),
    });
  }

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
    for (const img of imgList) {
      hashes.push({
        name: img,
        hash: hashAny(await backend.getPieceFileData(piece, img, "image")),
      });
    }
  }

  const slideList = await backend.getPieceSlideList(piece);
  if (slideList !== null) {
    for (const slide of slideList) {
      hashes.push({
        name: slide,
        hash: hashAny(await backend.getPieceFileData(piece, slide, "slide")),
      });
    }
  }

  hashes.sort((a, b) => {
    // first by name, then by hash
    const cmp1 = a.name.localeCompare(b.name);
    if (cmp1 != 0) return cmp1;
    const cmp2 = a.hash.localeCompare(b.hash);
    return cmp2;
  });

  const concat = hashes.map(({ name, hash }) => `${hash} ${name}\n`).join("");
  const result = hashAny(concat);

  return result;
};

export const hashAllContent = async function (backend: DataBackendBase, root: ContentPiece) {
  const hashes: Map<string, HashMapInfo> = new Map();

  await backend.walkContentPieces(root, async (piece, children) => {
    const hash = await hashPiece(backend, piece, children);
    const idjpath = piece.idpath.join("/");
    hashes.set(idjpath, { hash, idjpath, diskpath: piece.diskpath });
    return hash;
  });

  return hashes;
};
