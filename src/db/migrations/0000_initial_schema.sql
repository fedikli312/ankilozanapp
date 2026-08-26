CREATE TABLE `onboarding_state` (
	`id` text PRIMARY KEY NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`what_to_remember` text DEFAULT '[]' NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`language_override` text,
	`notification_detail_opt_in` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `check_in_body_area` (
	`check_in_id` text NOT NULL,
	`region` text NOT NULL,
	PRIMARY KEY(`check_in_id`, `region`),
	FOREIGN KEY (`check_in_id`) REFERENCES `daily_check_in`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_check_in` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`pain` integer NOT NULL,
	`fatigue` integer NOT NULL,
	`morning_stiffness_bucket` text NOT NULL,
	`wellbeing` integer,
	`notes` text,
	`flagged_important` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_check_in_date_unique` ON `daily_check_in` (`date`);--> statement-breakpoint
CREATE TABLE `medication` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dose` text NOT NULL,
	`notes` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE TABLE `medication_administration` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`medication_schedule_id` text,
	`scheduled_for` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`actual_time` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medication`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`medication_schedule_id`) REFERENCES `medication_schedule`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medication_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`frequency_type` text NOT NULL,
	`interval_days` integer,
	`reminder_enabled` integer DEFAULT true NOT NULL,
	`effective_from` text NOT NULL,
	`effective_until` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medication`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medication_schedule_day` (
	`medication_schedule_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	PRIMARY KEY(`medication_schedule_id`, `day_of_week`),
	FOREIGN KEY (`medication_schedule_id`) REFERENCES `medication_schedule`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medication_schedule_time` (
	`medication_schedule_id` text NOT NULL,
	`time_of_day` text NOT NULL,
	PRIMARY KEY(`medication_schedule_id`, `time_of_day`),
	FOREIGN KEY (`medication_schedule_id`) REFERENCES `medication_schedule`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `injection_administration` (
	`id` text PRIMARY KEY NOT NULL,
	`injection_treatment_id` text NOT NULL,
	`injection_schedule_id` text,
	`scheduled_for` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`actual_date` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`injection_treatment_id`) REFERENCES `injection_treatment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`injection_schedule_id`) REFERENCES `injection_schedule`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `injection_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`injection_treatment_id` text NOT NULL,
	`interval_days` integer NOT NULL,
	`reminder_lead_days` integer DEFAULT 1 NOT NULL,
	`reminder_on_scheduled_day` integer DEFAULT true NOT NULL,
	`effective_from` text NOT NULL,
	`effective_until` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`injection_treatment_id`) REFERENCES `injection_treatment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `injection_treatment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dose` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE TABLE `appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`doctor_or_institution` text,
	`date` text NOT NULL,
	`time` text,
	`notes` text,
	`reminder_lead_days` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lab_reminder` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`marker` text,
	`due_date` text NOT NULL,
	`reminder_lead_days` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lab_result` (
	`id` text PRIMARY KEY NOT NULL,
	`marker` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`recorded_date` text NOT NULL,
	`institution` text,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`notification_identifier` text NOT NULL,
	`scheduled_for` text NOT NULL,
	`is_repeating` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
