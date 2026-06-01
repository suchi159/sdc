ALTER TABLE `organizations` ADD `onboardingStep` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `onboardingCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `onboardingData` json;--> statement-breakpoint
ALTER TABLE `organizations` ADD `size` varchar(50);--> statement-breakpoint
ALTER TABLE `organizations` ADD `website` varchar(255);--> statement-breakpoint
ALTER TABLE `organizations` ADD `primaryColor` varchar(20) DEFAULT '#c8972a';--> statement-breakpoint
ALTER TABLE `organizations` ADD `subdomain` varchar(100);--> statement-breakpoint
ALTER TABLE `organizations` ADD `featuresEnabled` json;--> statement-breakpoint
ALTER TABLE `organizations` ADD `examConfig` json;--> statement-breakpoint
ALTER TABLE `organizations` ADD `monthlyBudget` int;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_subdomain_unique` UNIQUE(`subdomain`);