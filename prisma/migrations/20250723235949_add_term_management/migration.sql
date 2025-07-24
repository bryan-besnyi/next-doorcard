-- CreateEnum
CREATE TYPE "College" AS ENUM ('SKYLINE', 'CSM', 'CANADA');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FACULTY', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AppointmentCategory" AS ENUM ('OFFICE_HOURS', 'IN_CLASS', 'LECTURE', 'LAB', 'HOURS_BY_ARRANGEMENT', 'REFERENCE');

-- CreateEnum
CREATE TYPE "AnalyticsEvent" AS ENUM ('VIEW', 'PRINT_PREVIEW', 'PRINT_DOWNLOAD', 'EDIT_STARTED', 'SHARE', 'SEARCH_RESULT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'FACULTY',
    "college" "College",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doorcard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "doorcardName" TEXT NOT NULL,
    "officeNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "term" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "college" "College",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT,
    "userId" TEXT NOT NULL,
    "termId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doorcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "category" "AppointmentCategory" NOT NULL DEFAULT 'OFFICE_HOURS',
    "location" TEXT,
    "doorcardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoorcardDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalDoorcardId" TEXT,
    "data" JSONB NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoorcardDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoorcardAnalytics" (
    "id" TEXT NOT NULL,
    "doorcardId" TEXT NOT NULL,
    "eventType" "AnalyticsEvent" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoorcardAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoorcardMetrics" (
    "id" TEXT NOT NULL,
    "doorcardId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "totalPrints" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "lastPrintedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoorcardMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isUpcoming" BOOLEAN NOT NULL DEFAULT false,
    "archiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_college_idx" ON "User"("college");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Doorcard_slug_key" ON "Doorcard"("slug");

-- CreateIndex
CREATE INDEX "Doorcard_userId_idx" ON "Doorcard"("userId");

-- CreateIndex
CREATE INDEX "Doorcard_term_year_idx" ON "Doorcard"("term", "year");

-- CreateIndex
CREATE INDEX "Doorcard_college_idx" ON "Doorcard"("college");

-- CreateIndex
CREATE INDEX "Doorcard_isActive_idx" ON "Doorcard"("isActive");

-- CreateIndex
CREATE INDEX "Doorcard_isPublic_idx" ON "Doorcard"("isPublic");

-- CreateIndex
CREATE INDEX "Doorcard_slug_idx" ON "Doorcard"("slug");

-- CreateIndex
CREATE INDEX "Doorcard_createdAt_idx" ON "Doorcard"("createdAt");

-- CreateIndex
CREATE INDEX "Doorcard_officeNumber_idx" ON "Doorcard"("officeNumber");

-- CreateIndex
CREATE INDEX "Doorcard_termId_idx" ON "Doorcard"("termId");

-- CreateIndex
CREATE INDEX "Appointment_doorcardId_idx" ON "Appointment"("doorcardId");

-- CreateIndex
CREATE INDEX "Appointment_dayOfWeek_idx" ON "Appointment"("dayOfWeek");

-- CreateIndex
CREATE INDEX "Appointment_category_idx" ON "Appointment"("category");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "DoorcardDraft_userId_idx" ON "DoorcardDraft"("userId");

-- CreateIndex
CREATE INDEX "DoorcardDraft_originalDoorcardId_idx" ON "DoorcardDraft"("originalDoorcardId");

-- CreateIndex
CREATE INDEX "DoorcardDraft_lastUpdated_idx" ON "DoorcardDraft"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "DoorcardDraft_userId_id_key" ON "DoorcardDraft"("userId", "id");

-- CreateIndex
CREATE INDEX "DoorcardAnalytics_doorcardId_eventType_idx" ON "DoorcardAnalytics"("doorcardId", "eventType");

-- CreateIndex
CREATE INDEX "DoorcardAnalytics_doorcardId_createdAt_idx" ON "DoorcardAnalytics"("doorcardId", "createdAt");

-- CreateIndex
CREATE INDEX "DoorcardAnalytics_eventType_createdAt_idx" ON "DoorcardAnalytics"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "DoorcardAnalytics_sessionId_idx" ON "DoorcardAnalytics"("sessionId");

-- CreateIndex
CREATE INDEX "DoorcardAnalytics_createdAt_idx" ON "DoorcardAnalytics"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DoorcardMetrics_doorcardId_key" ON "DoorcardMetrics"("doorcardId");

-- CreateIndex
CREATE INDEX "DoorcardMetrics_totalViews_idx" ON "DoorcardMetrics"("totalViews");

-- CreateIndex
CREATE INDEX "DoorcardMetrics_uniqueViews_idx" ON "DoorcardMetrics"("uniqueViews");

-- CreateIndex
CREATE INDEX "DoorcardMetrics_lastViewedAt_idx" ON "DoorcardMetrics"("lastViewedAt");

-- CreateIndex
CREATE INDEX "Term_year_idx" ON "Term"("year");

-- CreateIndex
CREATE INDEX "Term_season_idx" ON "Term"("season");

-- CreateIndex
CREATE INDEX "Term_isActive_idx" ON "Term"("isActive");

-- CreateIndex
CREATE INDEX "Term_isArchived_idx" ON "Term"("isArchived");

-- CreateIndex
CREATE INDEX "Term_startDate_idx" ON "Term"("startDate");

-- CreateIndex
CREATE INDEX "Term_endDate_idx" ON "Term"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Term_name_key" ON "Term"("name");

-- AddForeignKey
ALTER TABLE "Doorcard" ADD CONSTRAINT "Doorcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doorcard" ADD CONSTRAINT "Doorcard_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doorcardId_fkey" FOREIGN KEY ("doorcardId") REFERENCES "Doorcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoorcardDraft" ADD CONSTRAINT "DoorcardDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoorcardAnalytics" ADD CONSTRAINT "DoorcardAnalytics_doorcardId_fkey" FOREIGN KEY ("doorcardId") REFERENCES "Doorcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoorcardMetrics" ADD CONSTRAINT "DoorcardMetrics_doorcardId_fkey" FOREIGN KEY ("doorcardId") REFERENCES "Doorcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
