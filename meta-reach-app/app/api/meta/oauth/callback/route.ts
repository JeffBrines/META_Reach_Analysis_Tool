import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/meta-accounts?error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/meta-accounts?error=invalid_request', request.url)
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://graph.facebook.com/v20.0/oauth/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get ad accounts for this user
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status`
    );

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch ad accounts');
    }

    const accountsData = await accountsResponse.json();
    const adAccounts = accountsData.data || [];

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
      throw new Error('No account found for user');
    }

    // Store all ad accounts
    for (const adAccount of adAccounts) {
      const encryptedToken = encryptToken(accessToken);

      await prisma.metaAccount.upsert({
        where: {
          accountId_metaAccountId: {
            accountId: primaryAccount.id,
            metaAccountId: adAccount.id,
          },
        },
        update: {
          accessToken: encryptedToken,
          metaAccountName: adAccount.name,
          updatedAt: new Date(),
        },
        create: {
          accountId: primaryAccount.id,
          metaAccountId: adAccount.id,
          metaAccountName: adAccount.name,
          accessToken: encryptedToken,
        },
      });
    }

    return NextResponse.redirect(
      new URL('/dashboard/meta-accounts?success=true', request.url)
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/meta-accounts?error=connection_failed', request.url)
    );
  }
}

