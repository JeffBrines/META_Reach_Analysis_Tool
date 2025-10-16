# V2 Setup Quick Reference

## Google Sheets Setup Checklist

### Setup Sheet Structure

#### Column A (Labels)
```
A1:  [Your choice - title or blank]
A2:  Ad Account ID
A3:  [blank]
A4:  Start Date
A5:  End Date
A6:  Analysis Type
A7:  Analysis Scope
A8:  Select Campaign
A9:  Campaign ID
A10: Status
A11: Run Account Analysis
A12: Run Campaign Analysis
A13: Run Ad Analysis
```

#### Column B (Inputs/Controls)
```
B2:  [Text Input] - User enters: act_XXXXXXXXXXXX
B3:  [blank]
B4:  [Date Input] - User enters start date
B5:  [Date Input] - User enters end date
B6:  [Dropdown] - Options: Daily | 7-Day Interval | 28-Day Interval | Daily with 28-Day Rolling
B7:  [Dropdown] - Options: All Campaigns | Specific Campaign
B8:  [Dropdown] - Auto-populated from DATA_Campaigns sheet
B9:  [Formula] - Auto-populated from campaign selection
B10: [Status Display] - Script updates this automatically
B11: [CHECKBOX] ← Insert > Checkbox
B12: [CHECKBOX] ← Insert > Checkbox
B13: [CHECKBOX] ← Insert > Checkbox
```

---

## Step-by-Step Setup

### 1. Create/Update Setup Sheet Labels
Copy this table structure to your Setup sheet:

| A | B |
|---|---|
| Ad Account ID | `[user input]` |
| | |
| Start Date | `[user date]` |
| End Date | `[user date]` |
| Analysis Type | `[dropdown]` |
| Analysis Scope | `[dropdown]` |
| Select Campaign | `[dropdown]` |
| Campaign ID | `[auto-fill]` |
| Status | `[script updates]` |
| Run Account Analysis | `[checkbox]` |
| Run Campaign Analysis | `[checkbox]` |
| Run Ad Analysis | `[checkbox]` |

### 2. Create Dropdown in B6 (Analysis Type)
1. Click cell B6
2. Go to **Data** > **Data validation**
3. Criteria: **List of items**
4. Enter: `Daily,7-Day Interval,28-Day Interval,Daily with 28-Day Rolling`
5. Click **Save**

### 3. Create Dropdown in B7 (Analysis Scope)
1. Click cell B7
2. Go to **Data** > **Data validation**
3. Criteria: **List of items**
4. Enter: `All Campaigns,Specific Campaign`
5. Click **Save**

### 4. Create Dropdown in B8 (Select Campaign)
1. Click cell B8
2. Go to **Data** > **Data validation**
3. Criteria: **List from a range**
4. Range: `DATA_Campaigns!A2:A` (campaign names from helper sheet)
5. Click **Save**

### 5. Create Formula in B9 (Campaign ID)
1. Click cell B9
2. Enter this formula:
```
=IF(ISBLANK(B8),"",VLOOKUP(B8,DATA_Campaigns!A:B,2,FALSE))
```
3. Press Enter

### 6. Insert Checkboxes in B11, B12, B13
1. Click cell B11
2. Go to **Insert** > **Checkbox**
3. Repeat for B12
4. Repeat for B13

### 7. Create DATA_Campaigns Sheet
1. Create a new sheet named exactly: `DATA_Campaigns`
2. Add headers in row 1:
   - A1: `Campaign Name`
   - B1: `Campaign ID`
3. This sheet will be populated automatically when you run "Get Campaigns with Spend"

---

## Apps Script Setup

### 1. Open Apps Script Editor
1. In Google Sheets: **Extensions** > **Apps Script**
2. Delete any existing code in Code.gs
3. Copy entire contents of `meta_reach_analysis_tool` file
4. Paste into Code.gs
5. Save (Ctrl+S / Cmd+S)
6. Name project: "META Reach Tool V2"

### 2. Close and Refresh
1. Close Apps Script editor tab
2. Return to Google Sheets
3. Refresh page (F5)
4. Wait a few seconds for menu to appear

### 3. Set Access Token
1. Click **META Reach Tool** menu (top menu bar)
2. Select **Set/Update Access Token**
3. Enter your long-lived Meta Marketing API token
4. Click OK

---

## First Run Test

### Minimal Test Configuration
```
B2:  act_[your_account_id]
B4:  [yesterday's date]
B5:  [yesterday's date]
B6:  Daily
B7:  All Campaigns
B11: ☑ (checked)
B12: ☐ (unchecked)
B13: ☐ (unchecked)
```

### Run Test
1. Click **META Reach Tool** > **2. Run Analysis**
2. Watch B10 (Status) for progress
3. Should see "Running Account Analysis..."
4. Then "All analyses complete!"
5. Check for new sheet: `DATA_Account_Output`

---

## Output Sheets (Auto-Created)

The script will automatically create these sheets:

### DATA_Account_Output
- Created when "Run Account Analysis" checkbox is checked
- Contains account-wide metrics with demographic breakdowns
- Format: Flat table, 1 TOTAL row + demographic rows per time period

### DATA_Campaign_Output
- Created when "Run Campaign Analysis" checkbox is checked
- Contains campaign-specific metrics with demographic breakdowns
- Requires campaign selection in B8/B9

### DATA_Ad_Output
- Created when "Run Ad Analysis" checkbox is checked
- Contains ad-level metrics with demographic breakdowns
- Can take longer to run with many ads

**Note**: Sheets are cleared and rewritten each time you run an analysis.

---

## Common Checkbox Combinations

### Just Account Overview
```
B11: ☑ Run Account Analysis
B12: ☐ Run Campaign Analysis
B13: ☐ Run Ad Analysis
```
**Best for**: Quick account-wide demographic insights

### Account + Campaign Deep Dive
```
B11: ☑ Run Account Analysis
B12: ☑ Run Campaign Analysis
B13: ☐ Run Ad Analysis
```
**Best for**: Compare overall account vs. specific campaign

### Campaign + Ads (Creative Analysis)
```
B11: ☐ Run Account Analysis
B12: ☑ Run Campaign Analysis
B13: ☑ Run Ad Analysis
```
**Best for**: Understanding which ads in a campaign drive performance

### Full Analysis (All Three)
```
B11: ☑ Run Account Analysis
B12: ☑ Run Campaign Analysis
B13: ☑ Run Ad Analysis
```
**Best for**: Comprehensive multi-level insights
**Warning**: Can take 10+ minutes for large accounts

---

## Analysis Type Guide

### Daily
- Each day is a separate period
- Best for day-by-day tracking
- Recommended date range: 7-30 days

### 7-Day Interval
- Week-by-week blocks
- Best for weekly reporting
- Recommended date range: 4-12 weeks

### 28-Day Interval
- Month-style blocks (28 days each)
- Best for monthly trends
- Recommended date range: 2-6 months

### Daily with 28-Day Rolling
- Daily periods with 28-day rolling window metrics
- **Adds 3 extra columns** to output
- Best for detecting audience saturation
- Recommended date range: 28-60 days
- **Note**: Requires 28+ days for meaningful data

---

## Formula Reference

### B9: Auto-populate Campaign ID
```
=IF(ISBLANK(B8),"",VLOOKUP(B8,DATA_Campaigns!A:B,2,FALSE))
```

### Optional: Data Validation Error Messages

#### For B6 (Analysis Type)
- Custom error message: "Please select: Daily, 7-Day Interval, 28-Day Interval, or Daily with 28-Day Rolling"

#### For B7 (Analysis Scope)
- Custom error message: "Please select: All Campaigns or Specific Campaign"

---

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Menu doesn't appear | Refresh page (F5) |
| "Token not set" error | Run "Set/Update Access Token" from menu |
| "No Campaign ID" error | Run "Get Campaigns" first, then select from B8 |
| "Check at least one level" | Check at least one box in B11-B13 |
| Checkboxes don't work | Use Insert > Checkbox, not typed text |
| Wrong campaign ID | Check B8 selection, verify B9 formula |
| No demographic data | Normal for small datasets, try longer date range |

---

## Visual Checklist

Before running analysis, verify:

- [ ] B2 has ad account ID in format: `act_XXXXXXXXXXXX`
- [ ] B4 has valid start date
- [ ] B5 has valid end date (must be >= start date)
- [ ] B6 has one of four analysis types selected
- [ ] B7 has "All Campaigns" or "Specific Campaign" selected
- [ ] If B7 = "Specific Campaign": B8 has campaign selected and B9 shows ID
- [ ] At least one checkbox in B11-B13 is checked
- [ ] Status cell B10 is visible (script will update it)
- [ ] DATA_Campaigns sheet exists (even if empty)
- [ ] Access token has been set via menu

---

## Sample Working Configuration

```
B2:  act_1234567890
B4:  2024-10-01
B5:  2024-10-07
B6:  Daily
B7:  All Campaigns
B8:  [blank or any campaign]
B9:  [blank or auto-filled]
B10: [displays status]
B11: ☑
B12: ☐
B13: ☐
```

This configuration will:
1. Analyze account ID `act_1234567890`
2. For dates October 1-7, 2024
3. With daily intervals (7 days = 7 periods)
4. All campaigns combined (account-wide view)
5. Only run account-level analysis
6. Output to `DATA_Account_Output`
7. Show ~147 rows (7 days × 21 rows per day)

---

## Need Help?

See full guides:
- **V2_DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **V2_UPGRADE_SUMMARY.md** - Technical details and changes
- **README.md** - Full feature documentation

---

**Last Updated**: October 2025  
**Version**: V2.0

