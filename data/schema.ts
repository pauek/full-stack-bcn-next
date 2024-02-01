import { relations } from "drizzle-orm";
import { date, json, jsonb, pgEnum, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const pieces = pgTable("pieces", {
  piece_hash: text("piece_hash").primaryKey(),
  name: text("name").notNull(),
  parent: text("parent_hash"),
  diskpath: text("diskpath").notNull(),
  createdAt: date("created_at", { mode: "date" }).notNull().defaultNow(),

  metadata: json("metadata").notNull().$type<Record<string, any>>(),
});
export const piecesRelations = relations(pieces, ({ one, many }) => ({
  parent: one(pieces, {
    fields: [pieces.parent],
    references: [pieces.piece_hash],
    relationName: "parent_child",
  }),
  children: many(pieces, { relationName: "parent_child" }),
  attachments: many(attachments, { relationName: "piece_attachments" }),
}));
export type DBPiece = typeof pieces.$inferSelect;

// FIXME: How to get values from the pgEnum definition??
export type FileTypeEnum = "doc" | "image" | "slide" | "cover" | "other";
export const fileTypeEnum = pgEnum("filetype", ["doc", "image", "slide", "cover", "other"]);

export const files = pgTable("files", {
  hash: text("file_hash").primaryKey(),
  data: jsonb("data").$type<string>().notNull(),
});
export const filesRelations = relations(files, ({ many }) => ({
  attachments: many(attachments, { relationName: "file_attachments" }),
}));

export const attachments = pgTable(
  "attachments",
  {
    piece: text("piece_hash")
      .notNull()
      .references(() => pieces.piece_hash),
    file: text("file_hash")
      .notNull()
      .references(() => files.hash),
    filetype: fileTypeEnum("filetype").notNull(),
    filename: text("filename").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.piece, table.file, table.filetype],
    }),
  })
);
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  piece: one(pieces, {
    fields: [attachments.piece],
    references: [pieces.piece_hash],
    relationName: "piece_attachments",
  }),
  file: one(files, {
    fields: [attachments.file],
    references: [files.hash],
    relationName: "file_attachments",
  }),
}));
