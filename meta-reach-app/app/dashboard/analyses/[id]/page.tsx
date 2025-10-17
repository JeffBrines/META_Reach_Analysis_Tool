import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricsTable } from '@/components/analysis/MetricsTable';
import { ReachTrendChart } from '@/components/analysis/ReachTrendChart';
import { CPMiTrendChart } from '@/components/analysis/CPMiTrendChart';
import { ExportButton } from '@/components/analysis/ExportButton';
import { Calendar, BarChart3, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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
  WEEKLY: '7-Day Intervals',
  MONTHLY: '28-Day Intervals',
  DAILY_ROLLING_28: 'Daily with 28-Day Rolling',
};

export default async function AnalysisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get analysis with access check
  const analysis = await prisma.analysis.findFirst({
    where: {
      id: params.id,
      account: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    },
    include: {
      metaAccount: {
        select: {
          metaAccountName: true,
          metaAccountId: true,
        },
      },
      metrics: {
        orderBy: [
          { periodStart: 'asc' },
          { demographic: 'asc' },
        ],
      },
    },
  });

  if (!analysis) {
    notFound();
  }

  const statusInfo = statusConfig[analysis.status];
  const StatusIcon = statusInfo.icon;

  // Separate total and demographic metrics
  const totalMetrics = analysis.metrics.filter((m) => m.demographic === 'TOTAL');
  const demographicMetrics = analysis.metrics.filter((m) => m.demographic !== 'TOTAL');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {analysis.name || `${levelLabels[analysis.level]} Analysis`}
            </h1>
            <p className="mt-2 text-gray-600">
              {analysis.metaAccount.metaAccountName || analysis.metaAccount.metaAccountId}
              {analysis.entityName && ` • ${analysis.entityName}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={statusInfo.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusInfo.label}
            </Badge>
            {analysis.status === 'COMPLETED' && (
              <ExportButton analysisId={analysis.id} />
            )}
          </div>
        </div>

        {/* Metadata */}
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
          {analysis.includeDemographics && (
            <div>
              Demographics: Enabled
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {analysis.status === 'FAILED' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              {analysis.errorMessage || 'An unknown error occurred'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Processing state */}
      {analysis.status === 'PROCESSING' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Analysis...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This may take a few minutes depending on the date range and analysis level.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analysis.status === 'COMPLETED' && totalMetrics.length > 0 && (
        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="total">Data (Total)</TabsTrigger>
            {analysis.includeDemographics && demographicMetrics.length > 0 && (
              <TabsTrigger value="demographics">Data (Demographics)</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reach Trend</CardTitle>
                  <CardDescription>Rolling reach over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReachTrendChart metrics={totalMetrics} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CPMi Trend</CardTitle>
                  <CardDescription>Cost per incremental 1000 users</CardDescription>
                </CardHeader>
                <CardContent>
                  <CPMiTrendChart metrics={totalMetrics} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="total">
            <Card>
              <CardHeader>
                <CardTitle>Aggregated Metrics</CardTitle>
                <CardDescription>
                  Total metrics across all demographics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsTable 
                  metrics={totalMetrics} 
                  intervalType={analysis.intervalType}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {analysis.includeDemographics && demographicMetrics.length > 0 && (
            <TabsContent value="demographics">
              <Card>
                <CardHeader>
                  <CardTitle>Demographic Breakdowns</CardTitle>
                  <CardDescription>
                    Metrics broken down by age and gender
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricsTable 
                    metrics={demographicMetrics} 
                    intervalType={analysis.intervalType}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Empty state */}
      {analysis.status === 'COMPLETED' && totalMetrics.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No metrics were generated for this analysis. This may be due to no ad spend in the selected date range.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

