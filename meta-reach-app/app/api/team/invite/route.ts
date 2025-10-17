import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, email } = body;

    if (!accountId || !email) {
      return NextResponse.json(
        { error: 'Account ID and email are required' },
        { status: 400 }
      );
    }

    // Verify user is the owner of the account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only account owner can invite members' },
        { status: 403 }
      );
    }

    // Check if user with this email exists
    let invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user doesn't exist, we'll need to send them a signup invitation
    // For MVP, we'll use Supabase's invitation system
    if (!invitedUser) {
      // Send invitation email via Supabase
      const { data: authData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email.toLowerCase(),
        {
          data: {
            accountId: accountId,
          },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        }
      );

      if (inviteError) {
        throw new Error(inviteError.message);
      }

      // Create user record (will be finalized when they accept)
      if (authData.user) {
        invitedUser = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: email.toLowerCase(),
          },
        });
      }
    }

    if (!invitedUser) {
      throw new Error('Failed to create user');
    }

    // Check if already a member
    const existingMember = await prisma.accountMember.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this account' },
        { status: 409 }
      );
    }

    // Add as team member
    await prisma.accountMember.create({
      data: {
        accountId,
        userId: invitedUser.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

