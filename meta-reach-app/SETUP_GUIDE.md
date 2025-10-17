# Setup Guide - META Reach Analysis Web App

## Prerequisites

- Node.js 18+ installed
- A Meta Developer account (for OAuth later)
- Git installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: `meta-reach-tool` (or whatever you prefer)
   - **Database Password**: Generate a strong password and **save it**
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project" and wait 2-3 minutes for setup

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

## Step 3: Get Supabase API Keys

1. Still in project settings, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: Long string starting with `eyJ...`
   - **service_role** key: Another long string (click "Reveal" first)

## Step 4: Generate Encryption Key

In your terminal, run:

```bash
openssl rand -hex 32
```

This generates a 32-byte hex key for encrypting Meta tokens. **Save this output**.

## Step 5: Create Environment File

In the `meta-reach-app` directory, create a file called `.env.local`:

```bash
cd meta-reach-app
touch .env.local
```

Then add this content (replace with YOUR values):

```env
# Database (from Step 2)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase (from Step 3)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Encryption (from Step 4)
ENCRYPTION_KEY="your-32-byte-hex-key-here"

# Meta API (we'll set this up later for OAuth)
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
```

## Step 6: Install Dependencies & Generate Prisma Client

```bash
# Make sure you're in meta-reach-app directory
cd meta-reach-app

# Install dependencies (if not already done)
npm install

# Generate Prisma client from schema
npx prisma generate
```

## Step 7: Push Database Schema to Supabase

This creates all the tables in your Supabase database:

```bash
npx prisma db push
```

You should see output like:
```
✔ Generated Prisma Client
✔ Applied migrations
Your database is now in sync with your Prisma schema.
```

## Step 8: Verify Database Setup

Check that tables were created:

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can see your database tables:
- User
- Account
- AccountMember
- MetaAccount
- Analysis
- AnalysisMetric

You should see all 6 tables with 0 rows each.

## Step 9: Start Development Server

```bash
npm run dev
```

The app should start at `http://localhost:3000`

## Step 10: Test Signup Flow

1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: testpassword123
   - Account Name: Test Company
3. Click "Create account"
4. If successful, you'll be redirected to `/` (we haven't built the dashboard yet, so you'll see the default Next.js page)

## Verify It Worked

Go back to Prisma Studio (`npx prisma studio`):
- **User** table should have 1 row (your user)
- **Account** table should have 1 row (your account)

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env.local` file exists in `meta-reach-app` directory
- Check that `DATABASE_URL` is spelled correctly
- Try restarting the dev server

### "Can't reach database server"
- Verify the DATABASE_URL is correct
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Ensure your Supabase project is running (check dashboard)

### "Prisma Client did not initialize yet"
- Run `npx prisma generate` again
- Restart your dev server

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## What We're Using Supabase For

In our implementation, we're using Supabase as:
- ✅ **PostgreSQL Database**: Stores users, accounts, analyses, metrics
- ❌ **Supabase Auth**: We built custom auth with bcrypt (simpler for MVP)

We access Supabase via:
- **Prisma**: Type-safe database queries
- **Direct PostgreSQL connection**: Through DATABASE_URL

The `lib/supabase/client.ts` and `lib/supabase/server.ts` files are created for future use (real-time features, file storage, etc.) but not currently used.

## Next Steps

Once you've completed this setup:

1. ✅ Database is connected
2. ✅ Can create users and accounts
3. ⏳ Next: Build the dashboard layout
4. ⏳ Next: Implement Meta OAuth
5. ⏳ Next: Build analysis features

## Quick Reference: Useful Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# View database in browser
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Start dev server
npm run dev
```

## Need Help?

Check these resources:
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)


