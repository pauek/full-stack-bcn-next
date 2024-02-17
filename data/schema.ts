import { relations } from "drizzle-orm";
import { date, index, json, jsonb, pgEnum, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// Pieces

export const pieces = pgTable("pieces", {
  pieceHash: text("piece_hash").primaryKey(),
  name: text("name").notNull(),
  diskpath: text("diskpath").notNull(),
  createdAt: date("created_at", { mode: "date" }).notNull().defaultNow(),

  metadata: json("metadata").notNull().$type<Record<string, any>>(),
});
export const piecesRelations = relations(pieces, ({ many }) => ({
  parents: many(relatedPieces, { relationName: "parent_relation" }),
  children: many(relatedPieces, { relationName: "child_relation" }),
  attachments: many(attachments, { relationName: "piece_attachments" }),
}));
export type DBPiece = typeof pieces.$inferSelect;

// HAS-A Relation

export const relatedPieces = pgTable(
  "related_pieces",
  {
    parentHash: text("parent")
      .notNull()
      .references(() => pieces.pieceHash),
    childHash: text("child")
      .notNull()
      .references(() => pieces.pieceHash),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.parentHash, table.childHash] }),
  })
);
export const childPiecesRelations = relations(relatedPieces, ({ one }) => ({
  parent: one(pieces, {
    fields: [relatedPieces.parentHash],
    references: [pieces.pieceHash],
    relationName: "child_relation",
  }),
  child: one(pieces, {
    fields: [relatedPieces.childHash],
    references: [pieces.pieceHash],
    relationName: "parent_relation",
  }),
}));

export enum FileType {
  doc = "doc",
  image = "image",
  slide = "slide",
  cover = "cover",
  exercise = "exercise",
  quiz = "quiz",
  other = "other",
}
export const FileTypeValues: [FileType, ...FileType[]] = Object.values(FileType) as [
  FileType,
  ...FileType[]
];
export const FileTypePg = pgEnum("filetype", FileTypeValues);

// Files

export const files = pgTable("files", {
  hash: text("file_hash").primaryKey(),
  data: jsonb("data").$type<string>().notNull(),
});
export const filesRelations = relations(files, ({ many }) => ({
  attachments: many(attachments, { relationName: "file_attachments" }),
}));

// Attachments

export const attachments = pgTable(
  "attachments",
  {
    pieceHash: text("piece_hash")
      .notNull()
      .references(() => pieces.pieceHash),
    fileHash: text("file_hash")
      .notNull()
      .references(() => files.hash),
    filetype: FileTypePg("filetype").notNull(),
    filename: text("filename").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.pieceHash, table.fileHash, table.filetype],
    }),
  })
);
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  piece: one(pieces, {
    fields: [attachments.pieceHash],
    references: [pieces.pieceHash],
    relationName: "piece_attachments",
  }),
  file: one(files, {
    fields: [attachments.fileHash],
    references: [files.hash],
    relationName: "file_attachments",
  }),
}));

// Hashmap

// With this we can locate any piece given an idjpath.
// Idjpaths give a good name to the hashes which are the true identifiers.

export const hashmap = pgTable(
  "hashmap",
  {
    idjpath: text("idjpath").primaryKey(),
    pieceHash: text("piece_hash")
      .notNull()
      .references(() => pieces.pieceHash),
  },
  (table) => ({
    hashIdx: index("hash_idx").on(table.pieceHash),
  })
);
export const hashmapRelations = relations(hashmap, ({ one }) => ({
  piece: one(pieces, {
    fields: [hashmap.pieceHash],
    references: [pieces.pieceHash],
    relationName: "hashmap_piece",
  }),
}));
