/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_profileId_fkey";

-- DropIndex
DROP INDEX "User_profileId_key";

-- DropTable
DROP TABLE "Profile";

-- CreateEnum
CREATE TYPE "Profile" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "profile" "Profile" NOT NULL DEFAULT 'USER';