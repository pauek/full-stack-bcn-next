CREATE TABLE IF NOT EXISTS "children" (
	"parent_piece_id" text NOT NULL,
	"child_piece_id" text NOT NULL,
	CONSTRAINT "children_parent_piece_id_child_piece_id_pk" PRIMARY KEY("parent_piece_id","child_piece_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"file_id" text PRIMARY KEY NOT NULL,
	"piece_id" text,
	"name" text NOT NULL,
	"data" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pieces" (
	"piece_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"string" text,
	"index" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_piece_id_pieces_piece_id_fk" FOREIGN KEY ("piece_id") REFERENCES "pieces"("piece_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
