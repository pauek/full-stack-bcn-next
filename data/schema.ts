import { relations, sql } from "drizzle-orm";
import { index, sqliteTable, primaryKey, text, integer, blob } from "drizzle-orm/sqlite-core";

// Pieces

export const pieces = sqliteTable("pieces", {
  pieceHash: text("piece_hash").primaryKey(),
  name: text("name").notNull(),
  diskpath: text("diskpath").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),

  metadata: text("metadata", { mode: "json" }).notNull().$type<Record<string, any>>(),
});
export const piecesRelations = relations(pieces, ({ many }) => ({
  parents: many(relatedPieces, { relationName: "parent_relation" }),
  children: many(relatedPieces, { relationName: "child_relation" }),
  attachments: many(attachments, { relationName: "piece_attachments" }),
}));
export type DBPiece = typeof pieces.$inferSelect;

// HAS-A Relation

export const relatedPieces = sqliteTable(
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
  video = "video",
  other = "other",
}
export const AllAttachmentTypes = [
  FileType.image,
  FileType.slide,
  FileType.exercise,
  FileType.quiz,
];
export const FileTypeValues: [FileType, ...FileType[]] = Object.values(FileType) as [
  FileType,
  ...FileType[]
];

const FileTypes: [string, ...string[]] = FileTypeValues.map((type) => String(type)) as [
  string,
  ...string[]
];

export const fileTypeFromString = (filetype: string): FileType => {
  switch (filetype) {
    case "image":
      return FileType.image;
    case "slide":
      return FileType.slide;
    case "doc":
      return FileType.doc;
    case "cover":
      return FileType.cover;
    case "exercise":
      return FileType.exercise;
    case "quiz":
      return FileType.quiz;
    case "video":
      return FileType.video;
    case "other":
      return FileType.other;
    default:
      throw new Error(`Unknown filetype: ${filetype}`);
  }
};

// Files

export const files = sqliteTable("files", {
  hash: text("file_hash").primaryKey(),
  data: blob("data", { mode: "json" }).$type<string>().notNull(),
});
export const filesRelations = relations(files, ({ many }) => ({
  attachments: many(attachments, { relationName: "file_attachments" }),
  answers: many(quizAnswers),
}));

// Attachments

export const attachments = sqliteTable(
  "attachments",
  {
    pieceHash: text("piece_hash")
      .notNull()
      .references(() => pieces.pieceHash),
    fileHash: text("file_hash")
      .notNull()
      .references(() => files.hash),
    filetype: text("filetype", { enum: FileTypes }).notNull(),
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

export const hashmap = sqliteTable(
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

// Answers

// This is a collection of all answers to quizzes which we want
// to isolate in the server

export const quizAnswers = sqliteTable(
  "quiz_answers",
  {
    hash: text("hash")
      .notNull()
      .references(() => files.hash),
    answer: text("answer").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.hash, table.answer],
    }),
  })
);
