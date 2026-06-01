CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(64) NOT NULL,
	`data` json NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_section_unique` UNIQUE(`section`)
);
