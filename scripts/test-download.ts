import { getPieceWithChildren } from "@/lib/data/db";

const piece = await getPieceWithChildren(["fullstack", "git", "basic"]);
console.log(piece);