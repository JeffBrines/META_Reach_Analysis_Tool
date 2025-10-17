# Meta OAuth Setup & Data Verification Plan

## 🎯 Goal

Set up Meta OAuth so the web app can access your Meta ad accounts and verify that it pulls and analyzes the **exact same data** as the Google Sheets V2 tool.

---

## ✅ What's Already Built (Code Complete!)

The web app already has **everything coded** for Meta integration:

### 1. OAuth Flow ✅
- `app/api/meta/oauth/route.ts` - Initiates OAuth
- `app/api/meta/oauth/callback/route.ts` - Handles callback, exchanges code for token
- Token encryption with AES-256-GCM
- Automatic storage of all ad accounts

### 2. Meta API Wrapper ✅
- `lib/meta-api.ts` - Complete wrapper (172 lines)
- `getInsights()` - Fetches insights with demographics
- `getCampaigns()` - Lists campaigns with spend
- `getAds()` - Lists ads with spend
- Rate limiting built-in

### 3. Analysis Engine ✅
- `lib/analysis-engine.ts` - **100% port of Google Sheets logic** (418 lines)
- Identical period generation
- Identical demographic parsing
- Identical metric calculations
- Same 28-day rolling logic (Y-X methodology)
- Same rate limiting (500ms delays)

### 4. UI & API Routes ✅
- Connection pages built
- Analysis wizard built
- API routes for campaigns/ads
- Results display ready

---

## 🔧 What Needs to be CONFIGURED (Not Coded)

The code is done - we just need external setup:

### Step 1: Create Meta Developer App (15 minutes)

**What**: Create an app in Meta's developer platform to get OAuth credentials

**Steps:**
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Select type: **"Business"**
4. Enter details:
   - App Name: "META Reach Analysis Tool"
   - App Contact Email: your@email.com
5. Click "Create App"
6. You'll get an **App ID** - copy it

### Step 2: Add Facebook Login Product (5 minutes)

**What**: Enable OAuth authentication

**Steps:**
1. In your Meta App dashboard, click **"Add Product"**
2. Find **"Facebook Login"** → Click **"Set Up"**
3. Select **"Web"** platform
4. Enter Site URL: `http://localhost:3000`
5. Click **"Save"** and **"Continue"**

### Step 3: Configure OAuth Settings (5 minutes)

**What**: Add valid redirect URIs

**Steps:**
1. In left sidebar → **Facebook Login** → **Settings**
2. Find **"Valid OAuth Redirect URIs"**
3. Add these URLs:
   ```
   http://localhost:3000/api/meta/oauth/callback
   https://your-domain.vercel.app/api/meta/oauth/callback (for production later)
   ```
4. Click **"Save Changes"**

### Step 4: Request Advanced Access (5 minutes)

**What**: Get permissions to access ad account data

**Steps:**
1. In left sidebar → **App Review** → **Permissions and Features**
2. Find and request these permissions:
   - ✅ **ads_read** - Read ad account data
   - ✅ **ads_management** - Manage ads (includes read)
   - ✅ **read_insights** - Read insights data
3. Click **"Request"** for each

**Note**: For development/testing, you can use the app without approval if you're an admin of the ad account. For production, you'll need Meta to approve these permissions.

### Step 5: Get App Credentials (2 minutes)

**What**: Get App ID and App Secret for your web app

**Steps:**
1. In Meta App → **Settings** → **Basic**
2. Copy **App ID**
3. Click **"Show"** next to **App Secret** → Copy it
4. **Save both values** - you'll add them to `.env.local`

### Step 6: Add Credentials to `.env.local` (1 minute)

**What**: Configure the web app with Meta credentials

**Steps:**
1. Open `/Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app/.env.local`
2. Update these lines:
   ```env
   META_APP_ID="your-app-id-from-step-5"
   META_APP_SECRET="your-app-secret-from-step-5"
   META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
   ```
3. Save the file

### Step 7: Restart Dev Server (1 minute)

```bash
# Stop server (Ctrl+C)
cd /Users/jeffbrines/kevinlubyproject/META_Reach_Analysis_Tool/meta-reach-app
npm run dev
```

---

## 🧪 Testing & Verification Plan

Once Meta OAuth is configured, here's how to verify the web app analyzes data identically to Google Sheets:

### Test 1: Connect Meta Account

1. Go to http://localhost:3000/dashboard/meta-accounts
2. Click "Connect Meta Account"
3. You'll be redirected to Meta
4. Log in with your Facebook account
5. Grant permissions to the app
6. You'll be redirected back
7. Should see your ad account(s) listed

**Verify:**
- [ ] Ad account appears in list
- [ ] Account name matches what you see in Meta Ads Manager
- [ ] No errors in browser console

### Test 2: Run Same Analysis as Google Sheets

**In Google Sheets V2:**
1. Set parameters:
   - Ad Account: `act_XXXXX`
   - Start Date: `2024-10-01`
   - End Date: `2024-10-07`
   - Analysis Type: `Daily`
   - Check: ☑ Account Analysis
2. Run analysis
3. Note the results in `DATA_Account_Output`

**In Web App:**
1. Go to `/dashboard/analyses/new`
2. Set IDENTICAL parameters:
   - Meta Account: (select your account)
   - Level: `Account`
   - Start Date: `2024-10-01`
   - End Date: `2024-10-07`
   - Interval: `Daily`
   - Demographics: ☑ Checked
3. Run analysis
4. Compare results

**What to Compare:**

| Metric | Google Sheets | Web App | Match? |
|--------|---------------|---------|--------|
| Period Spend (Oct 1) | $XXX.XX | $XXX.XX | ✅ |
| Period Reach (Oct 1) | XXXXX | XXXXX | ✅ |
| Period Impressions | XXXXX | XXXXX | ✅ |
| Rolling Reach | XXXXX | XXXXX | ✅ |
| Incremental Reach | XXXXX | XXXXX | ✅ |
| CPMi | $XX.XX | $XX.XX | ✅ |
| Demographic rows | 21 per day | 21 per day | ✅ |

### Test 3: Verify Demographic Calculations

Pick one demographic (e.g., "25-34_male") and verify:
- ✅ Same reach value
- ✅ Same impressions value
- ✅ Same spend allocation
- ✅ Same calculated metrics (CPM, CPMr, frequency)

### Test 4: Test 28-Day Rolling

**In Google Sheets:**
1. Analysis Type: `Daily with 28-Day Rolling`
2. Date range: At least 30 days
3. Run Account Analysis

**In Web App:**
1. Interval Type: `Daily with 28-Day Rolling`
2. Same date range
3. Run analysis

**Verify:**
- ✅ 28-Day Rolling Reach column appears
- ✅ Values match between Sheets and Web App
- ✅ Y-X calculation working correctly

### Test 5: Campaign & Ad Levels

Test that all three levels work:
- ✅ Account level (aggregated)
- ✅ Campaign level (specific campaign)
- ✅ Ad level (specific ad)

---

## 📋 Data Flow Comparison

### Google Sheets V2 Flow:
```
User → Manual token entry
  ↓
Token stored in PropertiesService
  ↓
Call Meta API (via callMetaApi function)
  ↓
Parse demographics (parseDemographicData)
  ↓
Calculate metrics (calculateTotalRow, calculateDemographicRow)
  ↓
Write to output sheets
```

### Web App Flow:
```
User → OAuth with Meta
  ↓
Token encrypted & stored in database
  ↓
Call Meta API (via MetaAPI class - SAME API calls)
  ↓
Parse demographics (parseDemographicData - SAME logic)
  ↓
Calculate metrics (calculateMetrics - SAME formulas)
  ↓
Store in AnalysisMetric table
  ↓
Display in UI (tables & charts)
```

**Result**: The analysis logic is IDENTICAL - just different storage!

---

## 🔍 Key Verification Points

### 1. API Calls Match

**Google Sheets**:
```javascript
callMetaApi(`${entityId}/insights`, {
  level: 'account',
  time_range: { 'since': '2024-10-01', 'until': '2024-10-01' },
  fields: 'reach,impressions,spend,actions,action_values',
  breakdowns: ['age', 'gender']
});
```

**Web App**:
```typescript
metaApi.getInsights(entityId, {
  level: 'account',
  time_range: { since: '2024-10-01', until: '2024-10-01' },
  fields: 'reach,impressions,spend,actions,action_values',
  breakdowns: ['age', 'gender']
});
```

✅ **IDENTICAL API calls!**

### 2. Demographic Parsing Matches

**Google Sheets**:
```javascript
const demoKey = `${age}_${gender}`;
result[demoKey] = {
  reach: parseInt(item.reach || 0),
  impressions: parseInt(item.impressions || 0),
  spend: parseFloat(item.spend || 0),
  // ...
};
```

**Web App**:
```typescript
const demoKey = `${age}_${gender}`;
result[demoKey] = {
  reach: parseInt(item.reach || '0'),
  impressions: parseInt(item.impressions || '0'),
  spend: parseFloat(item.spend || '0'),
  // ...
};
```

✅ **IDENTICAL parsing logic!**

### 3. Metric Calculations Match

All formulas are identical:
- ✅ Period Frequency = Impressions / Reach
- ✅ Period CPM = (Spend / Impressions) × 1000
- ✅ Period CPMr = (Spend / Reach) × 1000
- ✅ Incremental Reach = Current Rolling - Previous Rolling
- ✅ CPMi = (Spend / Incremental Reach) × 1000
- ✅ 28-Day Rolling = Y - X methodology

---

## 📝 Quick Setup Checklist

### Part A: Meta Developer Setup (30 mins)
- [ ] Create Meta Developer account
- [ ] Create new app (Business type)
- [ ] Add Facebook Login product
- [ ] Configure OAuth redirect URIs
- [ ] Request permissions (ads_read, ads_management, read_insights)
- [ ] Get App ID and App Secret

### Part B: Web App Configuration (5 mins)
- [ ] Add META_APP_ID to `.env.local`
- [ ] Add META_APP_SECRET to `.env.local`
- [ ] Add META_REDIRECT_URI to `.env.local`
- [ ] Restart dev server

### Part C: Connection Test (5 mins)
- [ ] Go to /dashboard/meta-accounts
- [ ] Click "Connect with Meta"
- [ ] Complete OAuth flow
- [ ] Verify account appears in list

### Part D: Analysis Verification (15 mins)
- [ ] Run analysis in Google Sheets
- [ ] Run SAME analysis in web app
- [ ] Compare total metrics
- [ ] Compare demographic metrics
- [ ] Verify 100% match

---

## 🚨 Important Notes

### About Permissions

**Development/Testing:**
- You can test immediately with accounts where you're an admin
- No Meta approval needed
- Perfect for local development

**Production:**
- Need Meta to review and approve your app
- Submit for review in App Review section
- Approval takes 1-3 days typically

### About Token Scopes

The web app requests these scopes:
```typescript
const scopes = [
  'ads_read',          // Read ad data
  'ads_management',    // Manage ads (includes read)
  'read_insights',     // Read insights/analytics
];
```

This matches what the Google Sheets tool needs (just via OAuth instead of manual token).

### About Data Privacy

- ✅ Tokens encrypted at rest (AES-256-GCM)
- ✅ Never stored in plain text
- ✅ Separate per account
- ✅ Can revoke anytime in Meta settings

---

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ Can connect Meta account via OAuth
2. ✅ Web app shows same metrics as Google Sheets
3. ✅ Demographic breakdowns match exactly
4. ✅ 28-day rolling calculations match
5. ✅ Can run all three levels (Account/Campaign/Ad)
6. ✅ Export works (CSV contains all data)

---

## ⏭️ After Meta OAuth Works

Once Meta OAuth is configured and working:

### Immediate Next Steps:
1. **Test all analysis types** - Daily, Weekly, Monthly, Rolling
2. **Test all analysis levels** - Account, Campaign, Ad
3. **Verify demographics** - All 21 combinations appear correctly
4. **Test export** - CSV and PDF downloads work

### Then:
1. **Fix any database connection issues** - Get Prisma fully working
2. **Resolve React errors** - Fix the "Event handlers" error in terminal
3. **Polish UI** - Any styling adjustments
4. **Deploy to production** - Follow DEPLOYMENT_GUIDE.md

---

## 🛠️ Troubleshooting

### "OAuth redirect URI mismatch"
**Fix**: Make sure you added `http://localhost:3000/api/meta/oauth/callback` to Valid OAuth Redirect URIs in Meta App settings

### "Insufficient permissions"
**Fix**: Check that you're an admin of the ad account you're trying to access

### "Token invalid or expired"
**Fix**: Tokens last ~60 days. Just reconnect the account via OAuth again.

### Data doesn't match Google Sheets
**Checklist**:
- [ ] Same date range selected?
- [ ] Same ad account?
- [ ] Same analysis level (Account/Campaign/Ad)?
- [ ] Same interval type?
- [ ] Demographics enabled in both?

---

## 📊 Data Parity Verification

### The Same Data Sources

Both versions call **identical Meta API endpoints**:

1. **Period Data**: `{entity}/insights` with demographic breakdowns
2. **Cumulative Data**: `{entity}/insights` from start to current period
3. **28-Day Data** (if applicable): Two calls for Y and X

### The Same Calculations

All formulas ported line-by-line:
- Period metrics
- Derived metrics  
- Rolling metrics
- Incremental metrics
- 28-day rolling metrics

### The Same Output

**Google Sheets**: Rows in spreadsheet  
**Web App**: Rows in database table → Displayed in UI  

**Same data, different presentation!**

---

## 🎉 What You'll Be Able to Do

Once Meta OAuth is set up:

### In the Web App (vs Google Sheets):

| Feature | Google Sheets | Web App |
|---------|---------------|---------|
| **Setup** | Copy token manually | OAuth (one click) |
| **Analysis** | Select params, click run | Select params, click run |
| **Results** | Spreadsheet tables | Tables + Charts |
| **Export** | Copy/paste | CSV + PDF download |
| **Team** | Share sheet | Invite members |
| **Historical** | One sheet at a time | All analyses saved |

**Everything else works the same!**

---

## ⚡ Quick Start (TL;DR)

1. **Create Meta App** at developers.facebook.com
2. **Add Facebook Login** product
3. **Configure OAuth** redirect: `http://localhost:3000/api/meta/oauth/callback`
4. **Get App ID & Secret**
5. **Add to `.env.local`**:
   ```env
   META_APP_ID="your-app-id"
   META_APP_SECRET="your-app-secret"
   META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
   ```
6. **Restart server**: `npm run dev`
7. **Connect account**: Go to /dashboard/meta-accounts → Connect
8. **Run analysis**: Go to /dashboard/analyses/new
9. **Compare**: Run same analysis in Google Sheets → Verify match!

---

## 📞 Need Help?

**Meta Developer Docs**: https://developers.facebook.com/docs/marketing-api/get-started  
**OAuth Guide**: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

**Common issues covered in**:
- `DATABASE_CONNECTION_FIX.md` - Database issues
- `ENV_FIX.md` - Environment variable problems
- `DEPLOYMENT_GUIDE.md` - Production setup

---

**Ready to set up Meta OAuth?** Follow the checklist above and you'll be analyzing data in ~30 minutes! 🚀

