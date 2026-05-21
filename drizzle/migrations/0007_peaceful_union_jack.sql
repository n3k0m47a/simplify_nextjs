CREATE TABLE `pogo_lucky` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avatar_id` int NOT NULL,
	`pokedex_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3),
	`deleted_at` timestamp(3),
	CONSTRAINT `pogo_lucky_id` PRIMARY KEY(`id`),
	CONSTRAINT `pogo_lucky_avatar_pokedex_uniq` UNIQUE(`avatar_id`,`pokedex_id`)
);
--> statement-breakpoint
CREATE TABLE `pogo_pokedex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3),
	`deleted_at` timestamp(3),
	CONSTRAINT `pogo_pokedex_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pogo_lucky_avatarId_idx` ON `pogo_lucky` (`avatar_id`);