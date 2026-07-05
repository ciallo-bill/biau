-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Member"
ADD COLUMN "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "modelChannelId" TEXT,
ADD COLUMN "disabledAt" TIMESTAMP(3),
ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ChatSession"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "lastMessageAt" TIMESTAMP(3);
