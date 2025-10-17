-- CreateEnum
CREATE TYPE "AnalysisLevel" AS ENUM ('ACCOUNT', 'CAMPAIGN', 'AD');

-- CreateEnum
CREATE TYPE "IntervalType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'DAILY_ROLLING_28');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountMember" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaAccount" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "metaAccountId" TEXT NOT NULL,
    "metaAccountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "metaAccountId" TEXT NOT NULL,
    "name" TEXT,
    "level" "AnalysisLevel" NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "intervalType" "IntervalType" NOT NULL,
    "includeDemographics" BOOLEAN NOT NULL DEFAULT true,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisMetric" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "demographic" TEXT NOT NULL,
    "periodSpend" DOUBLE PRECISION NOT NULL,
    "periodReach" INTEGER NOT NULL,
    "periodImpressions" INTEGER NOT NULL,
    "periodConversions" INTEGER NOT NULL,
    "periodRevenue" DOUBLE PRECISION NOT NULL,
    "periodFrequency" DOUBLE PRECISION NOT NULL,
    "periodCPM" DOUBLE PRECISION NOT NULL,
    "periodCPMr" DOUBLE PRECISION NOT NULL,
    "periodCPA" DOUBLE PRECISION,
    "periodROAS" DOUBLE PRECISION,
    "rollingReach" INTEGER NOT NULL,
    "cumulativeImpressions" INTEGER NOT NULL,
    "rollingFrequency" DOUBLE PRECISION NOT NULL,
    "incrementalReach" INTEGER NOT NULL,
    "cpim" DOUBLE PRECISION,
    "rolling28Reach" INTEGER,
    "rolling28IncrementalReach" INTEGER,
    "rolling28CPMi" DOUBLE PRECISION,

    CONSTRAINT "AnalysisMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccountMember_accountId_userId_key" ON "AccountMember"("accountId", "userId");

-- CreateIndex
CREATE INDEX "MetaAccount_accountId_idx" ON "MetaAccount"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MetaAccount_accountId_metaAccountId_key" ON "MetaAccount"("accountId", "metaAccountId");

-- CreateIndex
CREATE INDEX "Analysis_accountId_status_idx" ON "Analysis"("accountId", "status");

-- CreateIndex
CREATE INDEX "Analysis_metaAccountId_idx" ON "Analysis"("metaAccountId");

-- CreateIndex
CREATE INDEX "AnalysisMetric_analysisId_periodStart_idx" ON "AnalysisMetric"("analysisId", "periodStart");

-- CreateIndex
CREATE INDEX "AnalysisMetric_analysisId_demographic_idx" ON "AnalysisMetric"("analysisId", "demographic");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountMember" ADD CONSTRAINT "AccountMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountMember" ADD CONSTRAINT "AccountMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAccount" ADD CONSTRAINT "MetaAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_metaAccountId_fkey" FOREIGN KEY ("metaAccountId") REFERENCES "MetaAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisMetric" ADD CONSTRAINT "AnalysisMetric_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

