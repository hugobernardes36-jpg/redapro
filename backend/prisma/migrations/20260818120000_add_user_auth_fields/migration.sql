-- AlterTable
ALTER TABLE `User`
    MODIFY `password` VARCHAR(191) NULL,
    ADD COLUMN `googleId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
