# Database Connection Fix

## The Problem

Prisma can't connect to Supabase with the standard connection string. Error:
```
Can't reach database server at `db.xsietscjnlwkvdmtvajb.supabase.co:5432`
```

## The Solution

Supabase provides TWO connection strings, and Prisma needs the **"Direct"** connection string, not the pooled one.

### Step 1: Get the Direct Connection String

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select the **"URI"** tab
6. **IMPORTANT**: Change the dropdown from "Transaction" to **"Session"** or look for "Direct connection"
7. Copy the URI (it will have port `:5432` at the end)

The Direct connection string looks like:
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

OR it might be:
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Step 2: Add SSL Parameter

Even with the direct connection, Prisma needs SSL enabled. Add this to the end:

```
?sslmode=require
```

### Step 3: Update Your `.env.local`

Replace the current `DATABASE_URL` in your `.env.local` file with:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xsietscjnlwkvdmtvajb.supabase.co:5432/postgres?sslmode=require"
```

**Make sure to:**
- Replace `[YOUR-PASSWORD]` with your actual password
- Keep the `?sslmode=require` at the end
- Use the direct connection (port 5432)
- Ensure no spaces in the URL

### Step 4: Restart the Dev Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
cd /Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app
npm run dev
```

### Step 5: Test Signup Again

Go to http://localhost:3000/signup and try creating an account again.

## Alternative: Use Connection Pooling String

If the direct connection still doesn't work, try the pooled connection with pgbouncer:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xsietscjnlwkvdmtvajb.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

Note: Port changes from `5432` to `6543` for pooled connections.

## How to Verify It Works

Once you've updated the connection string and restarted:

1. Go to http://localhost:3000/signup
2. Fill in the form
3. Click "Create account"
4. If successful → redirects to /dashboard
5. If you see the error again → check the connection string format

## Common Mistakes

❌ **Wrong port**: Using `6543` with sslmode=require
✅ **Correct**: Use `5432` with sslmode=require

❌ **Missing SSL**: Just the basic connection string
✅ **Correct**: Add `?sslmode=require` at the end

❌ **Spaces in URL**: Having spaces around the connection string
✅ **Correct**: No spaces in the entire URL

❌ **Wrong password**: Using `[YOUR-PASSWORD]` literally
✅ **Correct**: Replace with your actual Supabase database password

## Check Your Connection String Format

Your current connection should look like ONE of these:

### Option 1: Direct Connection (Recommended for Prisma)
```
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xsietscjnlwkvdmtvajb.supabase.co:5432/postgres?sslmode=require"
```

### Option 2: Pooled Connection (Alternative)
```
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xsietscjnlwkvdmtvajb.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

## After It Works

Once the connection works, you should see:
1. ✅ Signup completes without error
2. ✅ Redirects to /dashboard
3. ✅ User appears in Supabase Auth dashboard
4. ✅ User and Account records in database

Then I can verify everything worked by checking the database!

---

**Try updating your `.env.local` with the corrected DATABASE_URL and let me know!**

