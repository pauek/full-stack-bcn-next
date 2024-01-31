CREATE TABLE IF NOT EXISTS "paths" (
	"idjpath" text PRIMARY KEY NOT NULL,
	"piece_hash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pieces" DROP CONSTRAINT "pieces_idjpath_unique";--> statement-breakpoint
ALTER TABLE "pieces" DROP COLUMN IF EXISTS "idjpath";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paths" ADD CONSTRAINT "paths_piece_hash_pieces_piece_hash_fk" FOREIGN KEY ("piece_hash") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
