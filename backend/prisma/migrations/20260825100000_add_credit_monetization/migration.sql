CREATE TABLE `CreditLot` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `type` ENUM('FREE', 'PURCHASE') NOT NULL,
    `quantityGranted` INTEGER NOT NULL,
    `quantityRemaining` INTEGER NOT NULL,
    `purchaseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `CreditLot_purchaseId_key`(`purchaseId`),
    INDEX `CreditLot_userId_type_quantityRemaining_idx`(`userId`, `type`, `quantityRemaining`),
    UNIQUE INDEX `CreditLot_userId_type_purchaseId_key`(`userId`, `type`, `purchaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CreditLedgerEntry` (
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `creditLotId` VARCHAR(191) NOT NULL,
    `type` ENUM('FREE_GRANT', 'PURCHASE_GRANT', 'CONSUMPTION', 'CONSUMPTION_REVERSAL') NOT NULL,
    `amount` INTEGER NOT NULL,
    `purchaseId` VARCHAR(191) NULL,
    `redacaoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `CreditLedgerEntry_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `CreditLedgerEntry_purchaseId_idx`(`purchaseId`),
    INDEX `CreditLedgerEntry_redacaoId_idx`(`redacaoId`),
    PRIMARY KEY (`idempotencyKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CreditConsumption` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `redacaoId` INTEGER NOT NULL,
    `creditLotId` VARCHAR(191) NOT NULL,
    `status` ENUM('RESERVED', 'CONSUMED', 'REVERSED') NOT NULL DEFAULT 'RESERVED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizedAt` DATETIME(3) NULL,
    INDEX `CreditConsumption_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `CreditConsumption_redacaoId_idx`(`redacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Purchase` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `credits` INTEGER NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BRL',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'CHARGEBACK') NOT NULL DEFAULT 'PENDING',
    `externalReference` VARCHAR(191) NOT NULL,
    `preferenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Purchase_externalReference_key`(`externalReference`),
    UNIQUE INDEX `Purchase_preferenceId_key`(`preferenceId`),
    INDEX `Purchase_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `mercadoPagoPaymentId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'CHARGEBACK', 'UNKNOWN') NOT NULL,
    `statusDetail` VARCHAR(191) NULL,
    `amountCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Payment_purchaseId_key`(`purchaseId`),
    UNIQUE INDEX `Payment_mercadoPagoPaymentId_key`(`mercadoPagoPaymentId`),
    INDEX `Payment_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WebhookEvent` (
    `eventKey` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `mercadoPagoId` VARCHAR(191) NULL,
    `status` ENUM('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED') NOT NULL DEFAULT 'RECEIVED',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `lastError` VARCHAR(191) NULL,
    INDEX `WebhookEvent_mercadoPagoId_idx`(`mercadoPagoId`),
    INDEX `WebhookEvent_status_receivedAt_idx`(`status`, `receivedAt`),
    PRIMARY KEY (`eventKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CreditLot` ADD CONSTRAINT `CreditLot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CreditLot` ADD CONSTRAINT `CreditLot_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CreditLedgerEntry` ADD CONSTRAINT `CreditLedgerEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CreditLedgerEntry` ADD CONSTRAINT `CreditLedgerEntry_creditLotId_fkey` FOREIGN KEY (`creditLotId`) REFERENCES `CreditLot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CreditConsumption` ADD CONSTRAINT `CreditConsumption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CreditConsumption` ADD CONSTRAINT `CreditConsumption_creditLotId_fkey` FOREIGN KEY (`creditLotId`) REFERENCES `CreditLot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
