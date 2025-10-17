import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/crypto';
import { MetaAPI } from '@/lib/meta-api';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const metaAccountId = searchParams.get('metaAccountId');
    const entityId = searchParams.get('entityId'); // Campaign ID or Account ID
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!metaAccountId || !entityId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the meta account with encrypted token
    const metaAccount = await prisma.metaAccount.findFirst({
      where: {
        id: metaAccountId,
        account: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    });

    if (!metaAccount) {
      return NextResponse.json(
        { error: 'Meta account not found' },
        { status: 404 }
      );
    }

    // Decrypt token and fetch ads
    const accessToken = decryptToken(metaAccount.accessToken);
    const metaApi = new MetaAPI(accessToken);

    const ads = await metaApi.getAds(entityId, startDate, endDate);

    return NextResponse.json({ ads }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch ads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

