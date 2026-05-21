ALTER TABLE `session` ADD `impersonated_by` varchar(36);--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(50);--> statement-breakpoint
ALTER TABLE `user` ADD `banned` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_expires` timestamp(3);