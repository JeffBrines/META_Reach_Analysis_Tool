# META Reach Analysis Tool V2 - Deployment Guide

## Overview
This guide will help you deploy the newly upgraded V2 script to your Google Sheets.

---

## What Was Implemented

### Core Features Added
✅ **Demographic Breakdowns** - All metrics now broken down by age (13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+) and gender (male, female, unknown)

✅ **Ad-Level Analysis** - Analyze individual ad performance alongside account and campaign levels

✅ **28-Day Rolling Metrics** - New analysis type tracks incremental reach with floating 28-day window

✅ **Conversion & Revenue Tracking** - Monitor purchase conversions, attributed revenue, CPA, and ROAS

✅ **Multi-Level Execution** - Run Account, Campaign, and/or Ad analyses simultaneously via checkboxes

✅ **Three Output Sheets** - Separate clean data tables: `DATA_Account_Output`, `DATA_Campaign_Output`, `DATA_Ad_Output`

✅ **Enhanced Metrics** - Added Period CPMr, Period CPA, Period ROAS, 28-Day CPMi, and more

---

## Deployment Steps

### Step 1: Open Your Google Sheet
1. Open your existing META Reach Analysis Tool Google Sheet
2. Or create a new Google Sheet if starting fresh

### Step 2: Open Apps Script Editor
1. In Google Sheets, click **Extensions > Apps Script**
2. This opens the script editor in a new tab

### Step 3: Replace the Script
1. In the Apps Script editor, you'll see a file called `Code.gs` (or similar)
2. **Select all the existing code** and delete it
3. **Copy the entire contents** of the `meta_reach_analysis_tool` file
4. **Paste** into the Apps Script editor
5. Click the **Save** icon (disk icon) or press `Ctrl+S` / `Cmd+S`
6. Name the project "META Reach Tool V2" if prompted

### Step 4: Set Up the Setup Sheet
Your Setup sheet needs to have the following structure:

#### Existing Cells (Keep As-Is)
- **B2**: Ad Account ID input
- **B4**: Start Date input
- **B5**: End Date input
- **B6**: Analysis Type dropdown
- **B7**: Analysis Scope dropdown
- **B8**: Campaign Name dropdown
- **B9**: Campaign ID (auto-populated)
- **B10**: Status cell (displays progress)

#### New Cells to Add
Add these checkboxes to your Setup sheet:
- **B11**: Add label in A11: "Run Account Analysis" | Insert checkbox in B11
- **B12**: Add label in A12: "Run Campaign Analysis" | Insert checkbox in B12
- **B13**: Add label in A13: "Run Ad Analysis" | Insert checkbox in B13

**To insert a checkbox:**
1. Click on cell B11
2. Go to **Insert > Checkbox**
3. Repeat for B12 and B13

#### Update Analysis Type Dropdown (B6)
Update the dropdown in B6 to include these four options:
- Daily
- 7-Day Interval
- 28-Day Interval
- Daily with 28-Day Rolling *(NEW)*

**To update dropdown:**
1. Click on cell B6
2. Go to **Data > Data validation**
3. Edit the list to include all four options
4. Click Save

### Step 5: Initial Test Run
1. Close the Apps Script editor
2. **Refresh your Google Sheet** (press F5 or reload the browser tab)
3. You should see the **"META Reach Tool"** menu appear in the menu bar
4. If you haven't already, click **META Reach Tool > Set/Update Access Token**
5. Enter your long-lived Meta Marketing API access token

### Step 6: Configure and Run
1. Fill in your Setup sheet parameters:
   - Ad Account ID (B2)
   - Start/End Dates (B4, B5)
   - Analysis Type (B6)
   - Analysis Scope (B7)
2. Check at least one analysis level (B11-B13)
3. If analyzing a specific campaign:
   - Run **META Reach Tool > 1. Get Campaigns with Spend**
   - Select a campaign from the B8 dropdown
4. Click **META Reach Tool > 2. Run Analysis**

---

## Understanding the Output Structure

### Three Output Sheets
The script will automatically create three sheets (if they don't exist):

#### DATA_Account_Output
- Account-wide metrics with demographic breakdowns
- Each time period has 1 TOTAL row + multiple demographic rows
- Use for: Overall account performance by demographic

#### DATA_Campaign_Output  
- Campaign-specific metrics with demographic breakdowns
- Only populated if "Run Campaign Analysis" is checked
- Use for: Deep-dive into specific campaign demographics

#### DATA_Ad_Output
- Individual ad metrics with demographic breakdowns
- Only populated if "Run Ad Analysis" is checked
- Can analyze all ads (if scope = "All Campaigns") or ads in one campaign (if scope = "Specific Campaign")
- Use for: Creative-level performance by demographic

### Row Structure
For each time period, you'll see:
```
Row 1: Start=2024-10-01, End=2024-10-01, Demographic=TOTAL (aggregated)
Row 2: Start=2024-10-01, End=2024-10-01, Demographic=13-17_male
Row 3: Start=2024-10-01, End=2024-10-01, Demographic=13-17_female
Row 4: Start=2024-10-01, End=2024-10-01, Demographic=18-24_male
... (continues for all demographics with data)
```

### Column Structure (20-23 columns depending on analysis type)
1. Start Date
2. End Date
3. Level ID (account ID, campaign ID, or ad ID)
4. Level Name
5. Demographic (e.g., "25-34_male" or "TOTAL")
6. Period Spend
7. Period Reach
8. Period Impressions
9. Period Conversions
10. Period Revenue
11. Period Frequency
12. Period CPM
13. Period CPMr
14. Period CPA
15. Period ROAS
16. Rolling Reach
17. Cumulative Impressions
18. Rolling Frequency
19. Incremental Reach
20. CPMi
21. 28-Day Rolling Reach *(only if "Daily with 28-Day Rolling")*
22. 28-Day Rolling Incremental Reach *(only if "Daily with 28-Day Rolling")*
23. 28-Day CPMi *(only if "Daily with 28-Day Rolling")*

---

## Testing Checklist

Test these scenarios to ensure everything works:

### Basic Tests
- [ ] Menu appears after refreshing sheet
- [ ] Access token can be set/updated
- [ ] Status cell (B10) updates correctly
- [ ] "Get Campaigns" populates DATA_Campaigns sheet

### Analysis Tests
- [ ] Account-level analysis runs successfully
- [ ] Campaign-level analysis runs successfully
- [ ] Ad-level analysis runs successfully
- [ ] Multiple checkboxes work (e.g., Account + Campaign)
- [ ] All three checkboxes work simultaneously

### Analysis Type Tests
- [ ] Daily analysis works
- [ ] 7-Day Interval works
- [ ] 28-Day Interval works
- [ ] Daily with 28-Day Rolling works (adds 3 extra columns)

### Data Validation Tests
- [ ] TOTAL row appears for each time period
- [ ] Demographic rows appear below TOTAL
- [ ] Numbers are formatted as currency where appropriate
- [ ] Conversions and revenue appear (if pixel is configured)
- [ ] 28-day rolling columns only appear in "Daily with 28-Day Rolling" mode

---

## Troubleshooting

### "META Reach Tool" menu doesn't appear
- **Solution**: Refresh the sheet (F5) or close and reopen it
- If still missing, check that the script was saved correctly in Apps Script

### "META Access Token not set" error
- **Solution**: Run **META Reach Tool > Set/Update Access Token** and enter a valid token
- Ensure the token has access to the specified ad account

### "No Campaign ID found in cell B9" error
- **Solution**: Run **META Reach Tool > 1. Get Campaigns with Spend** first
- Then select a campaign from the dropdown in B8

### "Please check at least one analysis level" error
- **Solution**: Check at least one of the checkboxes in B11, B12, or B13

### Checkboxes don't work or show errors
- **Solution**: Make sure you inserted actual checkboxes (Insert > Checkbox) in B11-B13
- The script uses `.isChecked()` which requires actual checkbox objects

### API errors (various)
- **Solution**: Check that your access token is valid and has proper permissions
- Verify the ad account ID format: `act_XXXXXXXXXXXX`
- Ensure you have access to the specified account/campaign/ad
- Check Meta's API status if issues persist

### No demographic data appears
- **Solution**: This is normal for small datasets - Meta may not return demographic breakdowns if reach is too low
- Try a longer date range or account with more spend

### Conversions/Revenue are all zeros
- **Solution**: Ensure your Meta Pixel is properly configured for purchase tracking
- Check that `offsite_conversion.fb_pixel_purchase` events are firing
- Verify attribution windows are set correctly in Meta

### Script times out or runs very slowly
- **Solution**: Reduce date range (especially for daily analysis)
- Run analyses separately instead of all three simultaneously
- Ad-level analysis can be slow with many ads - consider analyzing specific campaigns
- Each API call has a 500ms delay for rate limiting - this is intentional

---

## Performance Tips

### For Large Accounts
- Start with weekly (7-Day Interval) instead of daily for initial analysis
- Run Account level first to get overall picture
- Then drill into specific campaigns rather than analyzing all ads at once

### For Long Date Ranges
- Break up analysis into smaller chunks (e.g., one month at a time)
- Copy/paste results into a master sheet
- Daily with 28-Day Rolling can be very slow for long ranges

### For Many Ads
- Use "Specific Campaign" scope for Ad-level analysis
- Analyze one campaign at a time
- Consider filtering to only top-spending campaigns

---

## Next Steps

### Analyze Your Data
1. Export output sheets to CSV or connect to Looker Studio
2. Create pivot tables by demographic to find patterns
3. Look for demographics with high reach but low conversion (creative opportunity)
4. Track 28-Day Rolling Incremental Reach to identify audience saturation

### Optimize Your Strategy
1. Use demographic insights to refine audience targeting
2. Create demographic-specific creative
3. Monitor CPMr by demographic to find efficient segments
4. Use ad-level analysis to identify winning creative patterns

### Share and Iterate
1. Share output sheets with your team
2. Build custom dashboards in Looker Studio
3. Track performance over time
4. Adjust creative strategy based on insights

---

## Support

For issues, questions, or contributions:
- **GitHub**: [META Reach Analysis Tool Repository](https://github.com/jokicpony/META_Reach_Analysis_Tool)
- **Creator**: Kevin Luby - [@luby_k](https://x.com/luby_k)

---

## Version Info

**Current Version**: V2.0  
**Upgrade Date**: 2025  
**Compatibility**: Google Sheets with Apps Script, Meta Marketing API v20.0

---

**Happy analyzing! 🚀**

