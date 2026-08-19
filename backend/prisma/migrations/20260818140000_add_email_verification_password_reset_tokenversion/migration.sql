-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationExpires` DATETIME(3) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetExpires` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_passwordResetToken_key` ON `User`(`passwordResetToken`);
