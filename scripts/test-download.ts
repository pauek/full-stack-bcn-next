import { getPieceWithChildren } from "@/lib/data/db/pieces";

const piece = await getPieceWithChildren(["fullstack", "git", "basic"]);
console.log(piece);