CREATE TABLE IF NOT EXISTS "related_pieces" (
	"parent" text NOT NULL,
	"child" text NOT NULL,
	CONSTRAINT "related_pieces_parent_child_pk" PRIMARY KEY("parent","child")
);
--> statement-breakpoint
ALTER TABLE "pieces" DROP COLUMN IF EXISTS "parent_hash";--> statement-breakpoint
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
