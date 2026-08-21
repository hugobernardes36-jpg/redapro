ALTER TABLE `User` ADD COLUMN `clerkUserId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_clerkUserId_key` ON `User`(`clerkUserId`);