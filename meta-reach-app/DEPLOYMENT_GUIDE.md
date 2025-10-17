# Deployment Guide - META Reach Analysis Tool Web App

## Overview

This guide will walk you through deploying the META Reach Analysis Tool web application to production using Vercel and Supabase.

---

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with the web app code
- [ ] Vercel account (free tier is fine)
- [ ] Production Supabase project created
- [ ] Meta Developer App configured
- [ ] All local testing completed successfully

---

## Part 1: Supabase Production Setup

### Step 1: Create Production Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Organization**: Your organization
   - **Name**: `meta-reach-prod` (or your choice)
   - **Database Password**: Generate strong password and **SAVE IT**
   - **Region**: Choose closest to your users
   - **Plan**: Pro recommended for production (or Free for testing)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### Step 2: Get Production Database Credentials

Once created, go to **Settings** → **Database**:

1. **Connection String (URI)**:
   - Copy the URI connection string
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Add `?sslmode=require` at the end
   - Example: `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require`

Go to **Settings** → **API**:

2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public** key
   - **service_role** key (click "Reveal")

### Step 3: Run Database Migrations

From your local `meta-reach-app` directory:

```bash
# Temporarily set production DATABASE_URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require"

# Push schema to production
npx prisma db push

# Verify tables created
npx prisma studio
```

Or manually in Supabase SQL Editor:
1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `schema.sql` file
3. Execute the SQL
4. Verify all 6 tables created in **Table Editor**

### Step 4: Configure Auth Settings

In Supabase Dashboard → **Authentication**:

1. **URL Configuration**:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/**`

2. **Email Templates** (optional):
   - Customize confirmation emails
   - Customize magic link emails
   - Add your branding

---

## Part 2: Meta Developer App Setup

### Step 1: Create Meta App (if not done)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Enter app name: "META Reach Analysis Tool"
5. Add your email
6. Create App ID

### Step 2: Configure OAuth

1. In your Meta App dashboard, go to **Settings** → **Basic**:
   - Copy **App ID**
   - Copy **App Secret** (click "Show")

2. Go to **Products** → Add **Facebook Login**

3. Go to **Facebook Login** → **Settings**:
   - Add **Valid OAuth Redirect URIs**:
     - `https://your-domain.vercel.app/api/meta/oauth/callback`
     - `http://localhost:3000/api/meta/oauth/callback` (for local testing)
   - Save changes

### Step 3: Request Permissions (if needed)

For production use with real ad accounts:

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions:
   - `ads_read`
   - `ads_management`
   - `read_insights`
3. Provide use case and submit for review

For development/testing:
- You can test with accounts where you're an admin without approval

---

## Part 3: Vercel Deployment

### Step 1: Connect GitHub Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `meta-reach-app`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 2: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add all variables:

```env
# Production Supabase
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Encryption (GENERATE NEW KEY!)
ENCRYPTION_KEY=<run: openssl rand -hex 32>

# Meta API
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=https://your-domain.vercel.app/api/meta/oauth/callback

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: Generate a **NEW** encryption key for production! Don't reuse your local one.

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

### Step 4: Configure Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `META_REDIRECT_URI` to use custom domain
5. Update Meta App redirect URI to use custom domain
6. Redeploy

---

## Part 4: Post-Deployment Verification

### Testing Checklist

Once deployed, test these critical flows:

#### Authentication
- [ ] Sign up with new email
- [ ] Receive confirmation email (if enabled)
- [ ] Confirm email (if required)
- [ ] Log in successfully
- [ ] Log out
- [ ] Log back in

#### Meta Connection
- [ ] Navigate to Meta Accounts
- [ ] Click "Connect Meta Account"
- [ ] Redirected to Meta OAuth
- [ ] Grant permissions
- [ ] Redirected back to app
- [ ] See connected account listed

#### Analysis Creation
- [ ] Click "New Analysis"
- [ ] Select Meta account
- [ ] Choose Account level
- [ ] Set date range (last 7 days)
- [ ] Click "Run Analysis"
- [ ] Wait for completion
- [ ] Redirected to results

#### Results Viewing
- [ ] Charts render correctly
- [ ] Data table shows all metrics
- [ ] Demographics tab works (if enabled)
- [ ] Numbers formatted correctly

#### Export
- [ ] Export CSV downloads
- [ ] Open CSV in Excel/Sheets - verify data
- [ ] Export PDF downloads
- [ ] PDF displays correctly

#### Team (if testing with multiple users)
- [ ] Invite team member
- [ ] They receive email
- [ ] They can sign up/login
- [ ] They see the account's analyses

---

## Part 5: Monitoring & Maintenance

### Set Up Error Tracking (Recommended)

**Option A: Vercel Analytics** (included free)
- Automatically tracks page views
- Shows Web Vitals
- No setup required

**Option B: Sentry** (better error tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:
```env
SENTRY_AUTH_TOKEN=your-token
NEXT_PUBLIC_SENTRY_DSN=your-dsn
```

### Monitor Database

In Supabase Dashboard:

1. **Database** → **Logs**: Check for errors
2. **Auth** → **Users**: Monitor sign-ups
3. **Table Editor**: Inspect data periodically

### Monitor Meta API Usage

- Check your Meta App dashboard for API call volume
- Ensure you're within rate limits (200 calls/hour)
- Monitor for errors in Vercel logs

---

## Part 6: Troubleshooting Production Issues

### "Can't reach database server"

**Cause**: DATABASE_URL incorrect or SSL not configured  
**Fix**: 
- Verify `?sslmode=require` is at end of URL
- Check password is correct (no special characters breaking URL)
- Try connection pooling port `6543` with `?pgbouncer=true`

### "Meta OAuth redirect mismatch"

**Cause**: Redirect URI not configured in Meta App  
**Fix**:
- Add `https://your-domain.vercel.app/api/meta/oauth/callback` to Valid OAuth Redirect URIs
- Wait 5 minutes for Meta to update
- Clear browser cache and try again

### "Unauthorized" or "Token expired"

**Cause**: Supabase session expired or invalid  
**Fix**:
- Log out and log back in
- Check middleware.ts is deployed correctly
- Verify Supabase URL and keys are correct in Vercel

### "Analysis timeout" or "504 Gateway Timeout"

**Cause**: Analysis taking too long (>60s serverless limit)  
**Fix**:
- Reduce date range
- Use larger intervals (Weekly instead of Daily)
- Implement background job processing (future enhancement)

### Build Failures

**Cause**: TypeScript errors or missing dependencies  
**Fix**:
- Run `npm run build` locally first
- Fix all TypeScript errors
- Verify all dependencies in package.json
- Check Vercel build logs for specific errors

---

## Part 7: Scaling Considerations

### When You Outgrow Free Tier:

**Supabase**:
- Free: 500MB database, 50,000 rows
- Pro ($25/mo): 8GB database, unlimited rows, daily backups

**Vercel**:
- Hobby: Unlimited bandwidth, 100GB-hours serverless
- Pro ($20/mo): Better performance, analytics, team features

### Performance Optimization:

1. **Add Redis Caching**:
   - Cache Meta API responses
   - Cache analysis results
   - Reduce database queries

2. **Implement Job Queue**:
   - Use Inngest or BullMQ
   - Run long analyses in background
   - Send email when complete

3. **Database Optimization**:
   - Add more indexes
   - Implement connection pooling
   - Archive old analyses

---

## Quick Commands Reference

```bash
# Local Development
npm run dev

# Build for Production
npm run build

# Start Production Build Locally
npm start

# Database Operations
npx prisma generate
npx prisma db push
npx prisma studio

# Deployment
git push origin web-app
# (Vercel auto-deploys from GitHub)
```

---

## Environment Variables Quick Reference

### Required for Production:

1. `DATABASE_URL` - Supabase PostgreSQL connection
2. `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
4. `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
5. `ENCRYPTION_KEY` - 32-byte hex for token encryption
6. `META_APP_ID` - Meta Developer App ID
7. `META_APP_SECRET` - Meta App Secret
8. `META_REDIRECT_URI` - OAuth callback URL

### Optional:

9. `NEXT_PUBLIC_APP_URL` - Full app URL (for invitations)

---

## Support & Help

### If You Get Stuck:

1. **Check Vercel logs**: Project → Deployments → [deployment] → Logs
2. **Check Supabase logs**: Database → Logs
3. **Check browser console**: F12 → Console tab
4. **Review documentation**: All guides in meta-reach-app/

### Common Issues:

- **"Module not found"**: Run `npm install` and redeploy
- **"Prisma Client not found"**: Add `npx prisma generate` to build command
- **Database errors**: Verify DATABASE_URL is correct
- **Auth errors**: Check Supabase Site URL and Redirect URLs

---

## 🎉 Ready to Deploy!

Once you've completed all the checklists above, your META Reach Analysis Tool web app will be live and accessible to the world!

**Estimated deployment time**: 30-45 minutes

**Good luck with your deployment!** 🚀

