import { ContentPieceMetadata } from "@/lib/adt";
import { base64ToBytes, bytesToBase64 } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { boolean, customType, integer, json, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const pieces = pgTable("pieces", {
  hash: text("piece_hash").primaryKey(),
  name: text("name").notNull(),
  idpath: text("idpath").notNull(),
  parent: text("parent_hash"),
  diskpath: text("diskpath").notNull(),

  metadata: json("metadata").notNull().$type<ContentPieceMetadata>(),
  
  // Should be in metadata
  // index: integer("index"),
  // numSlides: integer("num_slides").notNull(),
  // hasDoc: boolean("has_doc").notNull(),
  // hidden: boolean("hidden").notNull().default(false),
});
export const piecesRelations = relations(pieces, ({ one, many }) => ({
  parent: one(pieces, {
    fields: [pieces.parent],
    references: [pieces.hash],
    relationName: "parent_child",
  }),
  children: many(pieces, { relationName: "parent_child" }),
  files: many(files, { relationName: "piece_files" }),
}));
export type DBPiece = typeof pieces.$inferSelect;

export const files = pgTable("files", {
  hash: text("file_hash").primaryKey(),
  piece: text("piece_hash").notNull(),
  name: text("name").notNull(),
  data: jsonb("data").notNull(),
});
export const filesRelations = relations(files, ({ one }) => ({
  piece: one(pieces, {
    fields: [files.piece],
    references: [pieces.hash],
    relationName: "piece_files",
  }),
}));
