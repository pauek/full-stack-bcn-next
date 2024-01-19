import { getPieceWithChildren } from "@/lib/db/pieces";

const piece = await getPieceWithChildren(["fullstack", "git", "basic"]);
console.log(piece);