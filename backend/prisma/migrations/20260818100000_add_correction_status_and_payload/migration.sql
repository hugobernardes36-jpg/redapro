-- AlterTable
ALTER TABLE `Correcao`
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
    ADD COLUMN `motivo` TEXT NULL,
    ADD COLUMN `dadosIa` JSON NULL,
    MODIFY `feedback` TEXT NULL;