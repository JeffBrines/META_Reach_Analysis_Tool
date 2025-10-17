import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

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

    const primaryAccount = accounts[0];

    if (!primaryAccount) {
      return NextResponse.json({ metaAccounts: [] }, { status: 200 });
    }

    // Get connected Meta accounts
    const metaAccounts = await prisma.metaAccount.findMany({
      where: { accountId: primaryAccount.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        metaAccountId: true,
        metaAccountName: true,
      },
    });

    return NextResponse.json({ metaAccounts }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch meta accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meta accounts' },
      { status: 500 }
    );
  }
}

