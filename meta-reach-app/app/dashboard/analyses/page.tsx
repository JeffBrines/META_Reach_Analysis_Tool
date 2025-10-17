import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, BarChart3, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const levelLabels = {
  ACCOUNT: 'Account Level',
  CAMPAIGN: 'Campaign',
  AD: 'Ad',
};

const intervalLabels = {
  DAILY: 'Daily',
  WEEKLY: '7-Day',
  MONTHLY: '28-Day',
  DAILY_ROLLING_28: 'Daily + 28-Day Rolling',
};

export default async function AnalysesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
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

  const accountIds = accounts.map((a) => a.id);

  // Get all analyses
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
      _count: {
        select: { metrics: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyses</h1>
          <p className="mt-2 text-gray-600">
            View and manage your Meta reach analyses
          </p>
        </div>
        <Link href="/dashboard/analyses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Analyses Yet</CardTitle>
            <CardDescription>
              Create your first analysis to start tracking reach, impressions, and demographic performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analyses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => {
            const statusInfo = statusConfig[analysis.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Link key={analysis.id} href={`/dashboard/analyses/${analysis.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {analysis.name || `${levelLabels[analysis.level]} Analysis`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {analysis.metaAccount.metaAccountName || analysis.metaAccount.metaAccountId}
                          {analysis.entityName && ` • ${analysis.entityName}`}
                        </CardDescription>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <BarChart3 className="mr-1 h-4 w-4" />
                        {levelLabels[analysis.level]}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(analysis.dateStart), 'MMM d, yyyy')} -{' '}
                        {format(new Date(analysis.dateEnd), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {intervalLabels[analysis.intervalType]}
                      </div>
                      {analysis._count.metrics > 0 && (
                        <div>
                          {analysis._count.metrics} metric rows
                        </div>
                      )}
                    </div>
                    {analysis.status === 'FAILED' && analysis.errorMessage && (
                      <div className="mt-3 text-sm text-red-600">
                        Error: {analysis.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

