CREATE TABLE `pogo_avatar_luckydex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avatar_id` int NOT NULL,
	`luckydex_id` int unsigned NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) DEFAULT (now()),
	`updated_at` timestamp(3),
	CONSTRAINT `pogo_avatar_luckydex_id` PRIMARY KEY(`id`),
	CONSTRAINT `pogo_avatar_luckydex_avatar_id_luckydex_id_key` UNIQUE(`avatar_id`,`luckydex_id`)
);
--> statement-breakpoint
CREATE TABLE `pogo_avatars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`created_at` timestamp(3) DEFAULT (now()),
	`updated_at` timestamp(3),
	CONSTRAINT `pogo_avatars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pogo_luckydex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pokedex_id` int unsigned NOT NULL,
	`pokedex_no` int NOT NULL,
	`name` varchar(191) NOT NULL,
	`evolution` int,
	`created_at` datetime(3),
	`updated_at` datetime(3),
	`deleted_at` datetime(3),
	`trade` boolean,
	`base_trade` boolean,
	CONSTRAINT `pogo_luckydex_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pogo_pokedex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`family_id` int unsigned,
	`parent_id` int,
	`form` varchar(191),
	`national_dex_number` int,
	`name` varchar(191),
	`name_en` varchar(191),
	`image_src` text,
	`generation` int,
	`types` text,
	`type1` varchar(191),
	`type2` varchar(191),
	`max_cp` int,
	`attack` int,
	`defense` int,
	`stamina` int,
	`created_at` datetime(3),
	`updated_at` datetime(3),
	`deleted_at` datetime(3),
	`baby` boolean,
	`legendary` boolean,
	`mythical` boolean,
	`ultra_beast` boolean,
	`generation_id` int,
	`released` boolean,
	`exclusive` boolean,
	`regional` boolean,
	`not_tradeable` boolean,
	`note` text,
	`dynamax` boolean,
	CONSTRAINT `pogo_pokedex_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pogo_avatar_luckydex` ADD CONSTRAINT `pogo_avatar_luckydex_avatar_id_pogo_avatars_id_fk` FOREIGN KEY (`avatar_id`) REFERENCES `pogo_avatars`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pogo_avatar_luckydex` ADD CONSTRAINT `pogo_avatar_luckydex_luckydex_id_pogo_luckydex_id_fk` FOREIGN KEY (`luckydex_id`) REFERENCES `pogo_luckydex`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pogo_avatars` ADD CONSTRAINT `pogo_avatars_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pogo_luckydex` ADD CONSTRAINT `pogo_luckydex_pokedex_id_pogo_pokedex_id_fk` FOREIGN KEY (`pokedex_id`) REFERENCES `pogo_pokedex`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pokedex_family_id_fkey` ON `pogo_pokedex` (`family_id`);