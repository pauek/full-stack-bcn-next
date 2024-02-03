ALTER TABLE "idjpaths" RENAME COLUMN "hash" TO "piece_hash";--> statement-breakpoint
ALTER TABLE "idjpaths" ALTER COLUMN "idjpath" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idjpaths" ADD CONSTRAINT "idjpaths_piece_hash_pieces_piece_hash_fk" FOREIGN KEY ("piece_hash") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
