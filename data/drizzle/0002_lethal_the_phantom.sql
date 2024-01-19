DROP TABLE "children";--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_piece_id_pieces_piece_id_fk";
--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "piece_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pieces" ALTER COLUMN "string" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pieces" ADD COLUMN "num_slides" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pieces" ADD COLUMN "has_doc" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pieces" ADD COLUMN "parent_id" text;