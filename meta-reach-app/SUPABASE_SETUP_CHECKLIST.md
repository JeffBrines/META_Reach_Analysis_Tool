# Supabase Setup Checklist

## Your Tasks (Manual Setup)

### 1. Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or log in
- [ ] Click "New Project"
- [ ] Enter project details:
  - Name: `meta-reach-tool` (or your preference)
  - Database Password: **Generate strong password and save it**
  - Region: Choose closest to you
  - Plan: Free tier
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for provisioning

### 2. Get Connection Details
Once project is created, go to **Settings** → **Database**:

- [ ] Copy **Connection String** (URI format)
  - Should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres`
  - Replace `[YOUR-PASSWORD]` with your actual password

Go to **Settings** → **API**:

- [ ] Copy **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- [ ] Copy **anon public** key (starts with `eyJ...`)
- [ ] Copy **service_role** key (click "Reveal" first)

### 3. Generate Encryption Key
In terminal:
```bash
openssl rand -hex 32
```
- [ ] Copy the output (32-byte hex string)

### 4. Create Environment File

In the `meta-reach-app` directory:

```bash
cd meta-reach-app
```

Create `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-from-step-3"

# Meta API (will configure later)
META_APP_ID=""
META_APP_SECRET=""
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
```

- [ ] Replace all placeholder values with your actual values
- [ ] Double-check DATABASE_URL password is correct
- [ ] Save file

## What I'll Do (Once MCP Server is Added)

Once you add the Supabase MCP server, I can:

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Push Database Schema
```bash
npx prisma db push
```
This will create all 6 tables in your Supabase database:
- User
- Account
- AccountMember
- MetaAccount
- Analysis
- AnalysisMetric

### 7. Verify Tables
I'll be able to:
- List all tables via MCP
- Check table schemas
- Verify indexes are created
- Confirm relationships are set up

### 8. Test Authentication Flow
- Start dev server
- Test signup at `http://localhost:3000/signup`
- Verify user is created in database
- Test login flow

## After Setup Complete

Once everything is connected, we can:
- ✅ Create users and accounts
- ✅ Store encrypted Meta tokens
- ✅ Run analyses and store results
- ✅ Build the dashboard UI
- ✅ Continue with Phase 3+ features

## Troubleshooting

If you encounter issues, check:
- [ ] `.env.local` file exists in `meta-reach-app/` directory
- [ ] All environment variables are set
- [ ] DATABASE_URL password is correct (no special characters causing issues)
- [ ] Supabase project is running (check dashboard)
- [ ] You're in the correct directory when running commands

## Ready for MCP Server

Once you've completed steps 1-4 and added the Supabase MCP server configuration, let me know and I'll:
1. Generate the Prisma client
2. Push the schema to create tables
3. Test the database connection
4. Verify everything is working

---

**Status**: Waiting for Supabase project creation and MCP server setup


