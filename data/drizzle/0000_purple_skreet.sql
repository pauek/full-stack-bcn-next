CREATE TABLE IF NOT EXISTS "files" (
	"file_hash" text PRIMARY KEY NOT NULL,
	"piece_hash" text NOT NULL,
	"name" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pieces" (
	"piece_hash" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"diskpath" text NOT NULL,
	"num_slides" integer NOT NULL,
	"has_doc" boolean NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"parent_hash" text,
	"index" integer,
	"metadata" json
);
