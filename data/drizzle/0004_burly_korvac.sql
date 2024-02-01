ALTER TABLE "attachments" DROP CONSTRAINT "attachments_piece_hash_file_hash_pk";--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_piece_hash_file_hash_filetype_pk" PRIMARY KEY("piece_hash","file_hash","filetype");--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "filetype" "filetype" NOT NULL;