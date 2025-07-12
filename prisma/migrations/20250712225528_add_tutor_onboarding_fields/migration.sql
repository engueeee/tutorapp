-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profilePhoto" TEXT;
