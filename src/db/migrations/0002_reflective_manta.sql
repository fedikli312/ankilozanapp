ALTER TABLE `onboarding_state` ADD `goals` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_state` ADD `priority_symptoms` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_state` ADD `priority_body_areas` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_state` ADD `treatment_context` text;--> statement-breakpoint
ALTER TABLE `onboarding_state` ADD `onboarding_version` integer DEFAULT 1 NOT NULL;