ALTER TABLE `User`
  CHANGE `emailVerificationToken` `emailVerificationTokenHash` VARCHAR(191) NULL,
  CHANGE `passwordResetToken` `passwordResetTokenHash` VARCHAR(191) NULL;