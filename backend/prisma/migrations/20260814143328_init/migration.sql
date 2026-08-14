-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tema` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Correcao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `competencia1` INTEGER NOT NULL,
    `competencia2` INTEGER NOT NULL,
    `competencia3` INTEGER NOT NULL,
    `competencia4` INTEGER NOT NULL,
    `competencia5` INTEGER NOT NULL,
    `notaFinal` INTEGER NOT NULL,
    `feedback` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `redacaoId` INTEGER NOT NULL,

    UNIQUE INDEX `Correcao_redacaoId_key`(`redacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Redacao` ADD CONSTRAINT `Redacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correcao` ADD CONSTRAINT `Correcao_redacaoId_fkey` FOREIGN KEY (`redacaoId`) REFERENCES `Redacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
