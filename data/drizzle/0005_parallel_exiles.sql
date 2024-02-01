ALTER TABLE "attachments" ADD COLUMN "filename" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "filetype";