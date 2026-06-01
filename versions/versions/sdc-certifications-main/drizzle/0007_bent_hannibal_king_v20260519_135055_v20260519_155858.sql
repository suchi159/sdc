CREATE TABLE `exam_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`proctorId` int NOT NULL,
	`examId` int NOT NULL,
	`windowId` int NOT NULL,
	`orgId` int,
	`scheduledAt` bigint NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 60,
	`status` enum('pending','confirmed','cancelled_by_candidate','cancelled_by_proctor','completed','no_show') NOT NULL DEFAULT 'pending',
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`reminderSent24h` boolean NOT NULL DEFAULT false,
	`reminderSent1h` boolean NOT NULL DEFAULT false,
	`candidateNotes` text,
	`proctorNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proctor_availability_windows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proctorId` int NOT NULL,
	`orgId` int,
	`startsAt` bigint NOT NULL,
	`endsAt` bigint NOT NULL,
	`capacity` int NOT NULL DEFAULT 1,
	`bookedCount` int NOT NULL DEFAULT 0,
	`recurrenceDays` varchar(20),
	`recurrenceEndsAt` bigint,
	`status` enum('active','cancelled','full') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proctor_availability_windows_id` PRIMARY KEY(`id`)
);
