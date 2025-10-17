import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, email, name, accountName } = body;

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      );
    }

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user and account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email: email,
          name: name || null,
        },
      });

      // Create account owned by user
      const account = await tx.account.create({
        data: {
          name: accountName,
          ownerId: userId,
        },
      });

      return { user: newUser, account };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Setup account error:', error);
    return NextResponse.json(
      { error: 'An error occurred during account setup' },
      { status: 500 }
    );
  }
}

