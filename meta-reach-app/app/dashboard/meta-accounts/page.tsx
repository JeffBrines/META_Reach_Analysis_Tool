import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, CheckCircle2 } from 'lucide-react';

export default async function MetaAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
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

  const primaryAccount = accounts[0];

  // Get connected Meta accounts
  const metaAccounts = primaryAccount
    ? await prisma.metaAccount.findMany({
        where: { accountId: primaryAccount.id },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meta Ad Accounts</h1>
          <p className="mt-2 text-gray-600">
            Connect your Meta ad accounts to analyze campaign performance
          </p>
        </div>
        <Link href="/dashboard/meta-accounts/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        </Link>
      </div>

      {/* Success/Error Messages */}
      {params.success && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="inline mr-2 h-4 w-4" />
          Meta account(s) connected successfully!
        </div>
      )}
      {params.error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
          Error connecting Meta account: {params.error}
        </div>
      )}

      {/* Meta Accounts List */}
      {metaAccounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Meta Accounts Connected</CardTitle>
            <CardDescription>
              Connect your first Meta ad account to start analyzing your campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/meta-accounts/connect">
              <Button>
                <Database className="mr-2 h-4 w-4" />
                Connect Meta Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {metaAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.metaAccountName || 'Unnamed Account'}</CardTitle>
                    <CardDescription className="mt-1">
                      {account.metaAccountId}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Connected on {new Date(account.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

