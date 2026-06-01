CREATE TABLE `org_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`orgName` varchar(255),
	`orgEmail` varchar(320),
	`orgIndustry` varchar(100),
	`plan` enum('starter','professional','enterprise','api_saas') NOT NULL DEFAULT 'starter',
	`createdByAdminId` int NOT NULL,
	`status` enum('pending','accepted','expired','cancelled') NOT NULL DEFAULT 'pending',
	`acceptedAt` timestamp,
	`resultingOrgId` int,
	`notes` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `org_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `org_invites_token_unique` UNIQUE(`token`)
);
