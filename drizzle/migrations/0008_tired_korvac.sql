ALTER TABLE `pogo_pokedex` ADD `parent_id` int;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `pokemon_no` int NOT NULL;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `name_en` varchar(191);--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `form` varchar(191);--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `src` varchar(512);--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `generation` int;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `type1` varchar(64);--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `type2` varchar(64);--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `baby` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `legendary` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `mythical` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `ultra_beast` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `released` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `exclusive` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `regional` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `not_tradeable` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `trade` boolean;--> statement-breakpoint
ALTER TABLE `pogo_pokedex` ADD `note` text;