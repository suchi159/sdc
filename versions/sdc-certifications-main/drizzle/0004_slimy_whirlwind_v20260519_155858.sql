CREATE TABLE `proctor_bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proctorId` int NOT NULL,
	`accountHolderName` varchar(100) NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`accountLast4` varchar(4) NOT NULL,
	`routingNumber` varchar(20) NOT NULL,
	`accountType` enum('checking','savings') NOT NULL DEFAULT 'checking',
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proctor_bank_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `proctor_bank_accounts_proctorId_unique` UNIQUE(`proctorId`)
);
--> statement-breakpoint
CREATE TABLE `proctor_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proctorId` int NOT NULL,
	`sessionId` int,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`type` enum('session_fee','bonus','adjustment') NOT NULL DEFAULT 'session_fee',
	`status` enum('pending','available','paid_out') NOT NULL DEFAULT 'pending',
	`description` text,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proctor_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proctor_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proctorId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('requested','processing','completed','failed') NOT NULL DEFAULT 'requested',
	`bankAccountLast4` varchar(4),
	`bankAccountName` varchar(100),
	`bankRoutingNumber` varchar(20),
	`notes` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proctor_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`userId` int NOT NULL,
	`stripeSessionId` varchar(255) NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`credits` int DEFAULT 0,
	`plan` varchar(50),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `stripe_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_payments_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
CREATE TABLE `voucher_cohorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`examId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voucher_cohorts_id` PRIMARY KEY(`id`)
);
