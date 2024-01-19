import { base64ToBytes, bytesToBase64 } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { customType, integer, json, pgTable, text } from "drizzle-orm/pg-core";

export const pieces = pgTable("pieces", {
  id: text("piece_id").primaryKey(),
  name: text("name").notNull(),
  path: text("string").notNull(),
  diskpath: text("string").notNull(),
  numSlides: integer("num_slides").notNull(),
  hasDoc: integer("has_doc").notNull(),

  parent: text("parent_id"),
  index: integer("index"),
  metadata: json("metadata"),
});
export const piecesRelations = relations(pieces, ({ one, many }) => ({
  parent: one(pieces, {
    fields: [pieces.parent],
    references: [pieces.id],
    relationName: "parent_child",
  }),
  children: many(pieces, { relationName: "parent_child" }),
  files: many(files, { relationName: "piece_files" }),
}));

const base64bytes = customType<{
  data: Uint8Array;
  notNull: true;
}>({
  dataType() {
    return "text";
  },
  toDriver(value: Uint8Array) {
    return bytesToBase64(value);
  },
  fromDriver(value: unknown) {
    return base64ToBytes(value as string);
  },
});

export const files = pgTable("files", {
  id: text("file_id").primaryKey(),
  piece: text("piece_id").notNull(),
  name: text("name").notNull(),
  data: base64bytes("data"),
});
export const filesRelations = relations(files, ({ one }) => ({
  piece: one(pieces, {
    fields: [files.piece],
    references: [pieces.id],
    relationName: "piece_files",
  }),
}));
