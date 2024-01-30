CREATE TABLE IF NOT EXISTS "roots" (
	"piece_hash" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roots" ADD CONSTRAINT "roots_piece_hash_pieces_piece_hash_fk" FOREIGN KEY ("piece_hash") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
