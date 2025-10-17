import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Database, Plus, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
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
        include: {
          account: true,
        },
      },
    },
  });

  const accounts = [
    ...(userAccount?.ownedAccounts || []),
    ...(userAccount?.memberships.map(m => m.account) || []),
  ];

  const primaryAccount = accounts[0];

  // Get stats if account exists
  let metaAccountCount = 0;
  let analysisCount = 0;

  if (primaryAccount) {
    metaAccountCount = await prisma.metaAccount.count({
      where: { accountId: primaryAccount.id },
    });

    analysisCount = await prisma.analysis.count({
      where: { accountId: primaryAccount.id },
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your META Reach analysis workspace
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Accounts</CardTitle>
            <Database className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metaAccountCount}</div>
            <p className="text-xs text-gray-600">Connected ad accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisCount}</div>
            <p className="text-xs text-gray-600">All time analyses run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-gray-600">{primaryAccount?.name || 'No account'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              {metaAccountCount === 0
                ? 'Connect your first Meta ad account to begin analyzing your campaigns'
                : 'Ready to run your next analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metaAccountCount === 0 ? (
              <Link href="/dashboard/meta-accounts/connect">
                <Button className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Connect Meta Account
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/analyses/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {analysisCount === 0
                ? 'No analyses yet'
                : `${analysisCount} analyses run`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisCount === 0 ? (
              <p className="text-sm text-gray-600">
                Your recent analyses will appear here once you run your first analysis.
              </p>
            ) : (
              <Link href="/dashboard/analyses">
                <Button variant="outline" className="w-full">
                  View All Analyses
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
