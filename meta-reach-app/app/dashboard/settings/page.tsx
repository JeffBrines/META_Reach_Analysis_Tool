import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowRight } from 'lucide-react';

export default async function SettingsPage() {
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
    ...(userAccount?.memberships.map((m) => m.account) || []),
  ];

  const primaryAccount = accounts[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Account Name</p>
              <p className="text-lg font-medium">{primaryAccount?.name || 'No account'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Name</p>
              <p className="text-lg font-medium">{user.user_metadata?.name || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Invite and manage team members who can access your analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings/team">
              <Button variant="outline" className="w-full justify-between">
                Manage Team
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

