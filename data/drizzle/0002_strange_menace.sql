ALTER TABLE "idjpaths" RENAME TO "hashmap";--> statement-breakpoint
ALTER TABLE "hashmap" DROP CONSTRAINT "idjpaths_piece_hash_pieces_piece_hash_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hashmap" ADD CONSTRAINT "hashmap_piece_hash_pieces_piece_hash_fk" FOREIGN KEY ("piece_hash") REFERENCES "pieces"("piece_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
