DO $$ BEGIN
 CREATE TYPE "filetype" AS ENUM('doc', 'image', 'slide', 'cover', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
	"piece_hash" text NOT NULL,
	"file_hash" text NOT NULL,
	"filetype" "filetype" NOT NULL,
	"filename" text NOT NULL,
	CONSTRAINT "attachments_piece_hash_file_hash_filetype_pk" PRIMARY KEY("piece_hash","file_hash","filetype")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"file_hash" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idjpaths" (
	"idjpath" jsonb PRIMARY KEY NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pieces" (
	"piece_hash" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"diskpath" text NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"metadata" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "related_pieces" (
	"parent" text NOT NULL,
	"child" text NOT NULL,
	CONSTRAINT "related_pieces_parent_child_pk" PRIMARY KEY("parent","child")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_piece_hash_pieces_piece_hash_fk" FOREIGN KEY ("piece_hash") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_file_hash_files_file_hash_fk" FOREIGN KEY ("file_hash") REFERENCES "files"("file_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "related_pieces" ADD CONSTRAINT "related_pieces_parent_pieces_piece_hash_fk" FOREIGN KEY ("parent") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "related_pieces" ADD CONSTRAINT "related_pieces_child_pieces_piece_hash_fk" FOREIGN KEY ("child") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
