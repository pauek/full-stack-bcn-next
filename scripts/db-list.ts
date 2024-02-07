import { FileTypeEnum, fileTypeEnumValues } from "@/data/schema";
import { dbBackend } from "@/lib/data/db";
import { closeConnection, getPieceFilesByFiletype } from "@/lib/data/db";
import { getRoot } from "@/lib/data/root";
import { showExecutionTime } from "@/lib/utils";
import chalk from "chalk";

showExecutionTime(async () => {
  const info = dbBackend.getInfo();
  console.log(chalk.gray(`[${info}]`));
  
  const root = await getRoot(dbBackend);

  await dbBackend.walkContentPieces(root, async (piece, _children) => {
    console.log(piece.hash, piece.idpath.join("/"));
    for (const filetype of fileTypeEnumValues) {
      const files = await getPieceFilesByFiletype(piece.hash, filetype as FileTypeEnum);
      for (const file of files || []) {
        console.log(chalk.gray(`  ${file.hash} ${filetype} ${file.filename}`));
      }
    }
  });

  await closeConnection();
});
