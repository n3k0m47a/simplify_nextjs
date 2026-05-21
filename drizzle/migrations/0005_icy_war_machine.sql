CREATE TABLE `pogo_avatar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3),
	CONSTRAINT `pogo_avatar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pogo_avatar_userId_idx` ON `pogo_avatar` (`user_id`);