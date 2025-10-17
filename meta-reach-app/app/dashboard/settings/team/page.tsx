import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Crown, UserPlus } from 'lucide-react';
import { TeamInviteForm } from '@/components/team/TeamInviteForm';
import { format } from 'date-fns';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's account
  const userAccount = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      ownedAccounts: {
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      memberships: {
        include: {
          account: {
            include: {
              owner: true,
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const primaryAccount = userAccount?.ownedAccounts[0] || userAccount?.memberships[0]?.account;

  if (!primaryAccount) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Account Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You don't have an account yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = primaryAccount.ownerId === user.id;
  const allMembers = [
    { user: primaryAccount.owner, isOwner: true, invitedAt: primaryAccount.createdAt },
    ...primaryAccount.members.map((m) => ({ user: m.user, isOwner: false, invitedAt: m.invitedAt })),
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-2 text-gray-600">
          Manage team members for {primaryAccount.name}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invite Form */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
              <CardDescription>
                Add colleagues to your account. They'll have full access to all analyses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamInviteForm accountId={primaryAccount.id} />
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <Card className={!isOwner ? 'lg:col-span-2' : ''}>
          <CardHeader>
            <CardTitle>Team Members ({allMembers.length})</CardTitle>
            <CardDescription>
              People who have access to this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allMembers.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {format(new Date(member.invitedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div>
                    {member.isOwner ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Crown className="mr-1 h-3 w-3" />
                        Owner
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Users className="mr-1 h-3 w-3" />
                        Member
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

