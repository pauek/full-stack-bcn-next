CREATE TABLE `attachments` (
	`piece_hash` text NOT NULL,
	`file_hash` text NOT NULL,
	`filetype` text NOT NULL,
	`filename` text NOT NULL,
	PRIMARY KEY(`piece_hash`, `file_hash`, `filetype`),
	FOREIGN KEY (`piece_hash`) REFERENCES `pieces`(`piece_hash`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_hash`) REFERENCES `files`(`file_hash`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`file_hash` text PRIMARY KEY NOT NULL,
	`data` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hashmap` (
	`idjpath` text PRIMARY KEY NOT NULL,
	`piece_hash` text NOT NULL,
	FOREIGN KEY (`piece_hash`) REFERENCES `pieces`(`piece_hash`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `map_positions` (
	`piece_hash` text PRIMARY KEY NOT NULL,
	`left` real NOT NULL,
	`top` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	`z` integer DEFAULT 0 NOT NULL,
	`color` text NOT NULL,
	FOREIGN KEY (`piece_hash`) REFERENCES `pieces`(`piece_hash`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pieces` (
	`piece_hash` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`diskpath` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`metadata` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`hash` text NOT NULL,
	`answer` text NOT NULL,
	PRIMARY KEY(`hash`, `answer`),
	FOREIGN KEY (`hash`) REFERENCES `files`(`file_hash`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `related_pieces` (
	`parent` text NOT NULL,
	`child` text NOT NULL,
	PRIMARY KEY(`parent`, `child`),
	FOREIGN KEY (`parent`) REFERENCES `pieces`(`piece_hash`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child`) REFERENCES `pieces`(`piece_hash`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `hash_idx` ON `hashmap` (`piece_hash`);