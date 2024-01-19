import { base64ToBytes, bytesToBase64 } from "@/lib/utils";
import {
  customType,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

export const pieces = pgTable("pieces", {
  id: text("piece_id").primaryKey(),
  name: text("name").notNull(),
  path: text("string"),
  diskpath: text("string"),
  index: integer("index"),
  metadata: json("metadata"),
});

export const children = pgTable(
  "children",
  {
    parent: text("parent_piece_id").notNull(),
    child: text("child_piece_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.parent, table.child] }),
  })
);

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
  piece: text("piece_id").references(() => pieces.id),
  name: text("name").notNull(),
  data: base64bytes("data"),
});
