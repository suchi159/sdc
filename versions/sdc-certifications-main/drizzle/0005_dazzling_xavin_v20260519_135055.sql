CREATE TABLE `essay_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`questionId` int NOT NULL,
	`candidateId` int NOT NULL,
	`responseText` text NOT NULL,
	`rubric` json,
	`aiScore` decimal(5,2),
	`aiRationale` text,
	`humanScore` decimal(5,2),
	`humanReviewerId` int,
	`finalScore` decimal(5,2),
	`status` enum('pending','ai_scored','human_reviewed','finalized') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `essay_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_blueprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`totalQuestions` int NOT NULL DEFAULT 50,
	`sections` json,
	`passingScore` decimal(5,2) DEFAULT '70.00',
	`timeLimit` int,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_blueprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pre_exam_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`candidateId` int NOT NULL,
	`webcamOk` boolean DEFAULT false,
	`micOk` boolean DEFAULT false,
	`bandwidthOk` boolean DEFAULT false,
	`idVerified` boolean DEFAULT false,
	`idPhotoUrl` text,
	`roomScanOk` boolean DEFAULT false,
	`roomScanVideoUrl` text,
	`lockdownBrowserOk` boolean DEFAULT false,
	`completedAt` timestamp,
	`status` enum('pending','in_progress','passed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pre_exam_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `proctor_incidents` MODIFY COLUMN `type` enum('gaze_deviation','face_not_detected','multiple_faces','audio_anomaly','tab_switch','phone_detected','manual_flag','notebook_detected','second_monitor','screen_share_detected','identity_mismatch') NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `workflowStage` enum('draft','expert_review','qa_review','approved','published','archived') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `enemySimilarity` decimal(5,4);--> statement-breakpoint
ALTER TABLE `questions` ADD `enemyItemIds` json;