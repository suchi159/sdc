CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`keyHash` varchar(256) NOT NULL,
	`keyPrefix` varchar(12) NOT NULL,
	`permissions` json,
	`rateLimit` int DEFAULT 1000,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`orgId` int,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`resource` varchar(100),
	`resourceId` varchar(64),
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`userId` int NOT NULL,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`accessType` enum('purchased','voucher','org_license') DEFAULT 'purchased',
	CONSTRAINT `book_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`isbn` varchar(20),
	`description` text,
	`coverUrl` text,
	`fileUrl` text,
	`fileType` enum('epub','pdf') DEFAULT 'pdf',
	`industry` varchar(100),
	`price` decimal(10,2),
	`drmEnabled` boolean DEFAULT true,
	`maxPrintPercent` int DEFAULT 10,
	`tableOfContents` json,
	`vectorIndexId` text,
	`linkedExamId` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credential_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`badgeImageUrl` text,
	`criteria` text,
	`skills` json,
	`validityMonths` int,
	`isAnsiAligned` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credential_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credentialId` varchar(64) NOT NULL,
	`orgId` int NOT NULL,
	`candidateId` int NOT NULL,
	`templateId` int NOT NULL,
	`examId` int,
	`status` enum('active','expired','revoked','suspended') NOT NULL DEFAULT 'active',
	`score` decimal(5,2),
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`expiryDate` timestamp,
	`badgeJson` json,
	`cryptoSignature` text,
	`pdfUrl` text,
	`walletCardUrl` text,
	`linkedinShared` boolean DEFAULT false,
	`verificationUrl` text,
	`revokedAt` timestamp,
	`revokedReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `credentials_credentialId_unique` UNIQUE(`credentialId`)
);
--> statement-breakpoint
CREATE TABLE `credit_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`balance` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_balances_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_balances_orgId_unique` UNIQUE(`orgId`)
);
--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`candidateId` int NOT NULL,
	`orgId` int NOT NULL,
	`voucherId` int,
	`status` enum('scheduled','in_progress','completed','abandoned','flagged') NOT NULL DEFAULT 'scheduled',
	`score` decimal(5,2),
	`passed` boolean,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`responses` json,
	`proctorSessionId` int,
	`credentialId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`industry` varchar(100),
	`passingScore` decimal(5,2) DEFAULT '70.00',
	`timeLimit` int,
	`totalQuestions` int,
	`randomizeQuestions` boolean DEFAULT true,
	`randomizeOptions` boolean DEFAULT true,
	`adaptiveTesting` boolean DEFAULT false,
	`branchingLogic` json,
	`questionPools` json,
	`proctorType` enum('none','ai','virtual_human','in_person') DEFAULT 'ai',
	`allowedAttempts` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`credentialTemplateId` int,
	`linkedBookId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledger_entries` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`userId` int,
	`type` enum('credit_purchase','voucher_generation','exam_redemption','book_purchase','refund','api_usage','subscription') NOT NULL,
	`amount` decimal(12,4) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`balanceBefore` decimal(12,4) NOT NULL,
	`balanceAfter` decimal(12,4) NOT NULL,
	`referenceId` varchar(128),
	`referenceType` varchar(64),
	`description` text,
	`cryptoHash` varchar(256),
	`prevHash` varchar(256),
	`stripePaymentId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ledger_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orgId` int,
	`type` enum('credential_issued','exam_scheduled','exam_result','expiry_reminder','proctoring_incident','system_alert','billing_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` boolean DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`logoUrl` text,
	`industry` varchar(100),
	`plan` enum('starter','professional','enterprise','api_saas') NOT NULL DEFAULT 'starter',
	`status` enum('active','suspended','trial') NOT NULL DEFAULT 'trial',
	`settings` json,
	`apiKey` varchar(128),
	`webhookUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `organizations_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `proctor_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`type` enum('gaze_deviation','face_not_detected','multiple_faces','audio_anomaly','tab_switch','phone_detected','manual_flag') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`description` text,
	`evidenceUrl` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`reviewedBy` int,
	`resolution` text,
	CONSTRAINT `proctor_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proctor_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examAttemptId` int NOT NULL,
	`candidateId` int NOT NULL,
	`proctorId` int,
	`type` enum('ai','virtual_human','in_person') NOT NULL,
	`status` enum('pending','active','completed','flagged') NOT NULL DEFAULT 'pending',
	`aiFlags` json,
	`incidentCount` int DEFAULT 0,
	`recordingUrl` text,
	`reportUrl` text,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proctor_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`parentId` int,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`categoryId` int,
	`createdBy` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`parentQuestionId` int,
	`type` enum('mcq','multi_select','true_false','short_answer','essay','drag_drop','image_hotspot','code_snippet') NOT NULL,
	`stem` text NOT NULL,
	`options` json,
	`correctAnswer` json,
	`explanation` text,
	`difficulty` int DEFAULT 3,
	`tags` json,
	`industryTemplate` varchar(100),
	`mediaUrl` text,
	`irtA` decimal(5,3),
	`irtB` decimal(5,3),
	`irtC` decimal(5,3),
	`pValue` decimal(5,4),
	`pointBiserial` decimal(5,4),
	`flaggedForReview` boolean DEFAULT false,
	`flagReason` text,
	`aiSuggestion` text,
	`status` enum('draft','active','archived','flagged') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`plan` enum('starter','professional','enterprise','api_saas') NOT NULL,
	`status` enum('active','cancelled','past_due','trialing') NOT NULL DEFAULT 'trialing',
	`stripeSubscriptionId` varchar(128),
	`stripeCustomerId` varchar(128),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`qrCode` text,
	`type` enum('exam','book','bundle') NOT NULL,
	`examId` int,
	`bookId` int,
	`status` enum('active','redeemed','expired','cancelled') NOT NULL DEFAULT 'active',
	`redeemedBy` int,
	`redeemedAt` timestamp,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vouchers_id` PRIMARY KEY(`id`),
	CONSTRAINT `vouchers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`url` text NOT NULL,
	`events` json NOT NULL,
	`secret` varchar(128),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`lastDeliveredAt` timestamp,
	`failureCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','org_admin','psychometrician','exam_developer','instructor','proctor','candidate','user','admin') NOT NULL DEFAULT 'candidate';--> statement-breakpoint
ALTER TABLE `users` ADD `orgId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','inactive','suspended') DEFAULT 'active' NOT NULL;