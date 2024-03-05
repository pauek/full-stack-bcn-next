/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'quiz_answers'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "quiz_answers" DROP CONSTRAINT "quiz_answers_pkey";--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_hash_answer_pk" PRIMARY KEY("hash","answer");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_hash_files_file_hash_fk" FOREIGN KEY ("hash") REFERENCES "files"("file_hash") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
