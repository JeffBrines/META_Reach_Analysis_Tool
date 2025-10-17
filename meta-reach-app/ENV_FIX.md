# Database Connection Fix - Use Connection Pooler

## The Issue

Prisma can't connect with the direct connection. We need to use Supabase's **connection pooler** instead.

## The Solution

### Get the Connection Pooler URL

1. Go to your Supabase Dashboard
2. **Settings** → **Database**
3. Find **Connection string** section
4. Click the **"Connection pooling"** tab (NOT "URI")
5. Make sure "Transaction" mode is selected in the dropdown
6. Copy that connection string

It should look like:
```
postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Note: Port is **6543** (not 5432) for pooler!

### Update Your `.env.local`

Replace your `DATABASE_URL` line with:

```env
DATABASE_URL="postgresql://postgres.xsietscjnlwkvdmtvajb:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Key differences:**
- Port: `6543` (pooler) instead of `5432` (direct)
- Add: `?pgbouncer=true&connection_limit=1` at the end
- URL might have `pooler.supabase.com` instead of just `supabase.co`

### Alternative: Use Direct Connection with Better SSL

If you want to stick with direct connection, try this format:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xsietscjnlwkvdmtvajb.supabase.co:5432/postgres?sslmode=require&connect_timeout=10"
```

## Quick Test

After updating `.env.local`:

1. **Stop the dev server** (Ctrl+C in terminal)
2. **Restart it**:
   ```bash
   cd /Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app
   npm run dev
   ```
3. **Visit** http://localhost:3000
4. **Should work now!**

## How to Verify Connection String is Loaded

Check if Prisma can see the variable:

```bash
cd /Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app
npx prisma validate
```

Should say "The schema is valid" if the connection works.

## Complete `.env.local` Template

Here's what your complete file should look like:

```env
# Database - USE THE CONNECTION POOLER!
DATABASE_URL="postgresql://postgres.xsietscjnlwkvdmtvajb:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xsietscjnlwkvdmtvajb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-here"

# Meta API (optional for now)
META_APP_ID=""
META_APP_SECRET=""
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
```

## Why Connection Pooler?

Supabase recommends connection pooler for:
- ✅ Serverless environments (Next.js)
- ✅ Many concurrent connections
- ✅ Better reliability
- ✅ Faster connection times

Direct connection (port 5432) is for:
- Long-running connections
- Traditional servers
- Database migrations

## After Fixing

Once your `.env.local` has the pooler URL:
1. Restart dev server
2. Visit http://localhost:3000
3. Should see the login page (or redirect to dashboard if logged in)
4. No more Prisma errors!

Let me know once you've updated it and I can verify the connection is working!

