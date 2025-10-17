import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { AnalysisEngine } from '@/lib/analysis-engine';
import { decryptToken } from '@/lib/crypto';
import { AnalysisLevel, IntervalType } from '@prisma/client';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's account
    const userAccount = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        ownedAccounts: true,
        memberships: {
          include: { account: true },
        },
      },
    });

    const accounts = [
      ...(userAccount?.ownedAccounts || []),
      ...(userAccount?.memberships.map((m) => m.account) || []),
    ];

    if (accounts.length === 0) {
      return NextResponse.json({ analyses: [] }, { status: 200 });
    }

    const accountIds = accounts.map((a) => a.id);

    // Get all analyses for user's accounts
    const analyses = await prisma.analysis.findMany({
      where: {
        accountId: { in: accountIds },
      },
      include: {
        metaAccount: {
          select: {
            metaAccountName: true,
            metaAccountId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error: any) {
    console.error('List analyses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      metaAccountId,
      level,
      entityId,
      entityName,
      dateStart,
      dateEnd,
      intervalType,
      includeDemographics,
      name,
    } = body;

    // Validation
    if (!metaAccountId || !level || !dateStart || !dateEnd || !intervalType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the meta account with access check
    const metaAccount = await prisma.metaAccount.findFirst({
      where: {
        id: metaAccountId,
        account: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        account: true,
      },
    });

    if (!metaAccount) {
      return NextResponse.json(
        { error: 'Meta account not found or no access' },
        { status: 404 }
      );
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        accountId: metaAccount.accountId,
        metaAccountId: metaAccount.id,
        name: name || null,
        level: level as AnalysisLevel,
        entityId: entityId || null,
        entityName: entityName || null,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        intervalType: intervalType as IntervalType,
        includeDemographics: includeDemographics !== false,
        status: 'PROCESSING',
      },
    });

    // Run analysis asynchronously (but wait for completion in MVP)
    try {
      const accessToken = decryptToken(metaAccount.accessToken);
      const engine = new AnalysisEngine(accessToken);

      const results = await engine.runAnalysis({
        metaAccountId: metaAccount.metaAccountId,
        level: level as AnalysisLevel,
        entityId: entityId || undefined,
        entityName: entityName || undefined,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        intervalType: intervalType as IntervalType,
        includeDemographics: includeDemographics !== false,
      });

      // Store all metric rows
      await prisma.analysisMetric.createMany({
        data: results.map((metric) => ({
          analysisId: analysis.id,
          periodStart: metric.periodStart,
          periodEnd: metric.periodEnd,
          demographic: metric.demographic,
          periodSpend: metric.periodSpend,
          periodReach: metric.periodReach,
          periodImpressions: metric.periodImpressions,
          periodConversions: metric.periodConversions,
          periodRevenue: metric.periodRevenue,
          periodFrequency: metric.periodFrequency,
          periodCPM: metric.periodCPM,
          periodCPMr: metric.periodCPMr,
          periodCPA: metric.periodCPA,
          periodROAS: metric.periodROAS,
          rollingReach: metric.rollingReach,
          cumulativeImpressions: metric.cumulativeImpressions,
          rollingFrequency: metric.rollingFrequency,
          incrementalReach: metric.incrementalReach,
          cpim: metric.cpim,
          rolling28Reach: metric.rolling28Reach,
          rolling28IncrementalReach: metric.rolling28IncrementalReach,
          rolling28CPMi: metric.rolling28CPMi,
        })),
      });

      // Update analysis status to completed
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ analysis }, { status: 201 });
    } catch (analysisError: any) {
      // Update analysis status to failed
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          errorMessage: analysisError.message,
        },
      });

      return NextResponse.json(
        { error: analysisError.message, analysisId: analysis.id },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Create analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}

