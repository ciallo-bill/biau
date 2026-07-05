-- CreateEnum
CREATE TYPE "ContentDraftStatus" AS ENUM ('DRAFT', 'REVIEW_NEEDED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentVisibility" AS ENUM ('HIDDEN', 'FEATURED', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ContentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'NEEDS_CHANGES', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiDailyIssueStatus" AS ENUM ('SOURCE_COLLECTED', 'EXTRACTED', 'SUMMARIZED', 'SYNTHESIZED', 'REVIEW_NEEDED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'NEEDS_MORE_EVIDENCE');

-- CreateTable
CREATE TABLE "ContentDraft" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "readTime" TEXT NOT NULL DEFAULT '8 min',
    "bodyJson" JSONB NOT NULL,
    "knowledgePoints" JSONB,
    "projectIds" JSONB,
    "status" "ContentDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'HIDDEN',
    "aiAssistance" TEXT NOT NULL DEFAULT 'none',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "status" "ContentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "checklistJson" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishExport" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "exportedFilesJson" JSONB NOT NULL,
    "checksJson" JSONB,
    "exportedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceTier" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'zh',
    "publishedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawExcerpt" TEXT,
    "summary" TEXT NOT NULL DEFAULT '',
    "tagsJson" JSONB,
    "riskFlagsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDailyIssue" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AiDailyIssueStatus" NOT NULL DEFAULT 'SOURCE_COLLECTED',
    "sourceIdsJson" JSONB NOT NULL,
    "briefJson" JSONB,
    "draftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDailyIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentDraft_slug_key" ON "ContentDraft"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AiDailyIssue_date_key" ON "AiDailyIssue"("date");

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishExport" ADD CONSTRAINT "PublishExport_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDailyIssue" ADD CONSTRAINT "AiDailyIssue_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
