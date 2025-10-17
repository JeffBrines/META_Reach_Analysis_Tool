# Meta OAuth Setup - Complete Beginner's Guide

## 🎯 What We're Doing

We need to tell Meta (Facebook) that your web app is allowed to access ad account data. This is done by creating a "Meta Developer App" and configuring OAuth permissions.

**Time required**: 15-20 minutes  
**Cost**: Free  
**Complexity**: Easy - just follow the steps!

---

## ✅ What You Already Have

I can see in your `.env.local` that you already have:
- `META_APP_ID="1087..."`
- `META_APP_SECRET="56e8..."`

This means you may have already created a Meta Developer App! Let's verify it's configured correctly.

---

## Step 1: Check If Your Meta App Exists

### 1a. Go to Meta Developers
1. Open browser and go to: **https://developers.facebook.com**
2. Click **"My Apps"** in top right
3. Log in with your Facebook account (if not already)

### 1b. Check for Existing App
- **If you see an app listed** → Great! Click on it and skip to **Step 2**
- **If you see "You don't have any apps"** → Continue to Step 1c

### 1c. Create New App (if needed)
1. Click **"Create App"** button
2. Select app type: **"Business"** → Click **Next**
3. Fill in details:
   - **App Name**: "META Reach Analysis Tool" (or whatever you want)
   - **App Contact Email**: your email
   - **Business Account**: Select if you have one, or skip
4. Click **"Create App"**
5. You may need to verify your account (phone/email)
6. Once created, you'll see your **App Dashboard**

---

## Step 2: Get Your App ID and Secret

### 2a. Find App ID
1. In your App Dashboard, look at the left sidebar
2. Click **"Settings"** → **"Basic"**
3. You'll see **"App ID"** at the top → Copy it
4. Compare with your `.env.local` - if they match, you're good!

### 2b. Get App Secret
1. On the same page, find **"App Secret"**
2. Click **"Show"** button
3. You may need to re-enter your Facebook password
4. Copy the secret
5. Compare with your `.env.local` - if they match, you're good!

**If they don't match**, update your `.env.local` with the correct values.

---

## Step 3: Add Facebook Login (Required for OAuth)

### 3a. Add the Product
1. In left sidebar, look for **"Add Products"** or **"Products"** section
2. Find **"Facebook Login"** in the products list
3. Click **"Set Up"** button next to it

### 3b. Choose Platform
1. You'll see platform options
2. Click **"Web"** (the globe icon)
3. For "Site URL", enter: `http://localhost:3000`
4. Click **"Save"** then **"Continue"**
5. You can skip the rest of the quickstart

---

## Step 4: Configure OAuth Redirect URIs (CRITICAL!)

### 4a. Go to Facebook Login Settings
1. In left sidebar → **"Facebook Login"** → **"Settings"**
2. Scroll down to **"Valid OAuth Redirect URIs"**

### 4b. Add Your Callback URL
1. In the text box, add this URL:
   ```
   http://localhost:3000/api/meta/oauth/callback
   ```
2. Press Enter or click outside the box
3. Scroll down and click **"Save Changes"**

**This is critical!** OAuth won't work without this.

### 4c. For Production (Later)
When you deploy to Vercel, come back here and add:
```
https://your-domain.vercel.app/api/meta/oauth/callback
```

---

## Step 5: Request Ad Account Permissions

### 5a. Go to App Review
1. In left sidebar → **"App Review"** → **"Permissions and Features"**

### 5b. Request Permissions
Find and click "Request" for these:
1. **ads_read** - Read ad account data
2. **ads_management** - Manage ads (includes read access)  
3. **read_insights** - Read analytics/insights

**For Development/Testing:**
- You can use these permissions RIGHT NOW without approval
- They work for ad accounts where you're an admin
- No need to wait for Meta review!

**For Production (later):**
- You'll need to submit for review
- Meta will ask for use case and app details
- Typically approved in 1-3 days

---

## Step 6: Add Yourself as a Test User (Development Only)

### 6a. Add Test Users
1. In left sidebar → **"Roles"** → **"Test Users"**
2. Click **"Add Test Users"** (optional, but helpful)
3. Or just use your own Facebook account

### 6b. Grant Permissions
Since you're the app developer:
1. You automatically have access
2. You can connect ANY ad account where you're an admin
3. No approval needed for testing!

---

## Step 7: Verify Your `.env.local` (Final Check)

Open `/Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app/.env.local`

Make sure these are set:

```env
META_APP_ID="1087..." # Your App ID from Settings → Basic
META_APP_SECRET="56e8..." # Your App Secret from Settings → Basic  
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
```

**Save the file if you made changes.**

---

## Step 8: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C in terminal)

# Start it again
cd /Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app
npm run dev
```

---

## Step 9: Test OAuth Connection! 🎉

### 9a. Go to Meta Accounts Page
1. Open browser: **http://localhost:3000/dashboard/meta-accounts**
2. You should see the Meta Accounts page

### 9b. Click "Connect Meta Account"
1. Click the button
2. You'll be redirected to **facebook.com**
3. You'll see a dialog asking for permissions:
   - "META Reach Analysis Tool would like to:"
   - Access your ad accounts
   - Read insights
   - etc.

### 9c. Grant Permissions
1. Make sure ALL permissions are checked
2. Click **"Continue"** or **"Allow"**
3. You'll be redirected back to your app

### 9d. Verify Success
1. You should land on `/dashboard/meta-accounts?success=true`
2. You should see a green success message
3. Your ad account(s) should be listed below!

---

## 🎊 Success Looks Like This:

**Meta Accounts Page:**
```
Meta Ad Accounts
Connect your Meta ad accounts to analyze campaign performance

[Green box] ✓ Meta account(s) connected successfully!

📊 Your Ad Account Name
    act_123456789
    [Connected badge]
    Connected on Oct 17, 2025
```

---

## 🐛 Troubleshooting Common Issues

### "App not found" or "Invalid App ID"
**Fix**: Double-check App ID and Secret in `.env.local` match your Meta App

### "Redirect URI mismatch"
**Fix**: Make sure you added `http://localhost:3000/api/meta/oauth/callback` to Valid OAuth Redirect URIs in Facebook Login → Settings

### "Insufficient permissions"
**Fix**: You need to be an admin of the ad account you're trying to connect. Check in Meta Ads Manager.

### "Error: Meta OAuth not configured"
**Fix**: Restart dev server after adding META_APP_ID and META_APP_SECRET

### Can't find Facebook Login in products
**Fix**: Click "Add Product" in left sidebar, then find Facebook Login

---

## ✨ After OAuth Works

Once you successfully connect a Meta account:

### Next: Run Your First Analysis!

1. Go to **http://localhost:3000/dashboard/analyses/new**
2. Select your Meta account
3. Choose **Account** level
4. Set date range (try last 7 days)
5. Choose **Daily** interval
6. Check **Include demographics**
7. Click **"Run Analysis"**
8. Wait 30-60 seconds
9. See your results with charts!

### Compare with Google Sheets

Run the SAME analysis in both:
- Google Sheets V2 tool
- Web app

Verify the numbers match - they should be **100% identical**!

---

## 📞 Need Help?

### Meta Developer Resources:
- **Developer Dashboard**: https://developers.facebook.com/apps
- **Marketing API Docs**: https://developers.facebook.com/docs/marketing-api
- **OAuth Guide**: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

### Common Questions:

**Q: Do I need a business account?**
A: No, personal Facebook account works fine for development.

**Q: Will this cost money?**
A: No, Meta Developer account and API access are free.

**Q: Can I test with real ad accounts?**
A: Yes! As long as you're an admin of the ad account.

**Q: How long does Meta review take?**
A: You don't need review for testing! Only for production with other users.

---

## 🚀 You're Almost There!

Based on your `.env.local`, you already have Meta credentials. You just need to:

1. ✅ Verify the app exists in developers.facebook.com
2. ✅ Make sure Facebook Login is added
3. ✅ Verify redirect URI is configured
4. ✅ Test the OAuth flow

**Let me know when you're ready to test, or if you hit any issues!** 🎉

I can walk you through each step if you get stuck anywhere.

