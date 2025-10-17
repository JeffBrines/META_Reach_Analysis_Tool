import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const metaAppId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!metaAppId || !redirectUri) {
    return NextResponse.json(
      { error: 'Meta OAuth not configured' },
      { status: 500 }
    );
  }

  // Build Meta OAuth URL
  const scopes = [
    'ads_read',
    'ads_management',
    'read_insights',
  ];

  const oauthUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  oauthUrl.searchParams.set('client_id', metaAppId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('scope', scopes.join(','));
  oauthUrl.searchParams.set('state', user.id); // Pass user ID for verification

  return NextResponse.redirect(oauthUrl.toString());
}

