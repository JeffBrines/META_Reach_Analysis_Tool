# META Marketing API - Reach Analysis Tool for Google Sheets

---

This tool, **V2.0**, was developed by Kevin Luby ([@luby_k](https://x.com/luby_k))/[LinkedIn](https://www.linkedin.com/in/kevin-luby-70b62445/), Director of Ecom at High Camp Flasks. It was developed with the assistance of Gemini 2.5 Pro and Claude Sonnet 4.5.

**License**  
This project is licensed under the GNU GPLv3 License - see the [LICENSE](https://github.com/jokicpony/META_Reach_Analysis_Tool/blob/main/LICENSE) file for details.

---

## CREATOR NOTE: 
This tool was vibe coded with LLMs. While I'm an above average technical person, I don't know how to write code from scratch, or 'check the work' of the LLM that wrote this script. I did work with it to ensure some level of security (see API token below). This script doesn't do anything groundbreaking. It just makes calls to the META Marketing Insights API. That said...
**Use this tool at your own risk**

---

## What's New in V2.0

V2.0 represents a major upgrade focused on demographic insights and creative optimization:

### New Features
- **Demographic Breakdowns**: Analyze reach, impressions, frequency, and all metrics by age and gender combinations
- **Ad-Level Analysis**: Dive deep into individual ad performance (in addition to account and campaign levels)
- **28-Day Rolling Metrics**: Track incremental reach with a floating 28-day lookback window
- **Conversion & Revenue Tracking**: Monitor conversions, attributed revenue, CPA, and in-platform ROAS
- **Multi-Level Execution**: Run Account, Campaign, and Ad analyses simultaneously via checkboxes
- **Enhanced Metrics**: Additional calculated metrics including Period CPMr, Period CPA, Period ROAS, and 28-Day Rolling CPMi

### Why V2?
In 2025, creative quality is the primary lever for ad delivery on Meta. The algorithm is incredibly effective at targeted distribution when given resonant creative. V2 enables marketers to optimize for reach and impressions across demographics rather than solely conversion-based optimization, which can cause the algorithm to "circle the drain" with the same audiences.

---

## Key Links
* [Get Started Document](https://docs.google.com/document/d/1TlWfs3no8iMvu-gHG9pxNhIMX2JOOJWJVOPQtM5tLxE/edit?usp=sharing)  
* [Video Walkthrough Of Tool](https://highcampflasks.neetorecord.com/watch/77b3a72aba0e88855fa4)  
* [Base Tool Spreadsheet Template](https://docs.google.com/spreadsheets/d/1_iONm4-WlSOJ5cySHrshIwoHKGIF7nXrNkBwmwKePFE/edit?usp=sharing)

---

## Key Features

* **Multiple Analysis Levels**: Choose to analyze at Account, Campaign, or Ad level (or all three simultaneously)
* **Analysis Scope**: De-duplicated account-level view (**'All Campaigns'**) or detailed single campaign analysis (**'Specific Campaign'**)
* **Interval Reporting**: Analyze performance in distinct blocks: **'Daily'**, **'7-Day Interval'**, **'28-Day Interval'**, or **'Daily with 28-Day Rolling'**
* **Demographic Insights**: Every metric is broken down by age/gender combinations for granular audience understanding
* **Rich Calculated Metrics**: Automatically calculates 20+ performance indicators. See the **Metrics Glossary** below
* **Conversion & Revenue Tracking**: Monitor purchase conversions and attributed revenue alongside reach metrics
* **Color-Coded Status**: Status cell indicates script state (**In Progress**, **Success**, or **Error**)
* **Multiple Output Sheets**: Separate clean flat tables for Account, Campaign, and Ad-level data

---

## Metrics Glossary

### Basic Dimensions
* **Start Date/End Date**: The start/end date of the specific interval block for the data in this row
* **Level ID**: The ID of the entity being analyzed (ad account ID, campaign ID, or ad ID)
* **Level Name**: The name of the entity being analyzed
* **Demographic**: Age and gender combination (e.g., "25-34_male") or "TOTAL" for aggregated data

### Period Metrics (Per Time Interval)
* **Period Spend**: Total ad spend during this specific period
* **Period Reach**: Unique users reached during this specific period
* **Period Impressions**: Total impressions during this specific period
* **Period Conversions**: Total purchase conversions during this specific period (from `offsite_conversion.fb_pixel_purchase`)
* **Period Revenue**: Total attributed revenue during this specific period (from `offsite_conversion.fb_pixel_purchase`)
* **Period Frequency**: Average times an ad was shown to each user. ($\text{Period Impressions} / \text{Period Reach}$)
* **Period CPM**: Cost per 1,000 Impressions. ($\text{Period Spend} / \text{Period Impressions} \times 1000$)
* **Period CPMr**: Cost per 1,000 Users Reached. ($\text{Period Spend} / \text{Period Reach} \times 1000$)
* **Period CPA**: Cost Per Acquisition. ($\text{Period Spend} / \text{Period Conversions}$)
* **Period ROAS**: Return on Ad Spend. ($\text{Period Revenue} / \text{Period Spend}$)

### Cumulative/Rolling Metrics
* **Rolling Reach**: Total unique users reached from the overall Start Date up to this period's End Date
* **Cumulative Impressions**: Total impressions from the overall Start Date up to this period's End Date
* **Rolling Frequency**: Average frequency from campaign start. ($\text{Cumulative Impressions} / \text{Rolling Reach}$)

### Incremental Metrics
* **Incremental Reach**: New unique users reached in this period compared to the previous period's Rolling Reach
* **CPMi**: Cost Per Incremental 1,000 Users Reached. ($\text{Period Spend} / \text{Incremental Reach} \times 1000$)

### 28-Day Rolling Metrics (Only Available with "Daily with 28-Day Rolling" Analysis Type)
* **28-Day Rolling Reach**: Total unique users reached in the 28 days ending on this period's End Date
* **28-Day Rolling Incremental Reach**: New unique users reached on this day compared to the previous 27 days. Calculated as: (Reach from Day-27 to Day) - (Reach from Day-27 to Day-1)
* **28-Day CPMi**: Cost Per 1,000 Incremental Users over the 28-day window. ($\text{Period Spend} / \text{28-Day Rolling Incremental Reach} \times 1000$)

---

## How to Use (Workflow)

### Initial Setup
1. **First Time**: Validate with your Google account when prompted
2. **Set Access Token**: Run **'META Reach Tool > Set/Update Access Token'** from the menu
   - Enter a valid long-lived Meta Marketing API user access token
   - For security, this stores your token in Google's PropertiesService (not visible in the sheet)

### Configure Report Parameters
Fill out the following in the **'Setup'** sheet:

* **B2**: Ad Account ID (formatted: `act_XXXXXXXXXXXX`)
* **B4**: Start Date
* **B5**: End Date
* **B6**: Analysis Type (Daily, 7-Day Interval, 28-Day Interval, or Daily with 28-Day Rolling)
* **B7**: Analysis Scope (All Campaigns or Specific Campaign)

### Select Analysis Levels
Check the boxes for the levels you want to analyze:
* **B11**: ☑ Run Account Analysis
* **B12**: ☑ Run Campaign Analysis
* **B13**: ☑ Run Ad Analysis

You can select one, two, or all three levels. Each will output to its own sheet.

### Optional: Campaign Selection
If using **'Specific Campaign'** scope for Campaign or Ad analysis:
1. Run **'META Reach Tool > 1. Get Campaigns with Spend'** to populate the campaign list
2. Select your desired campaign from the dropdown in **B8**
3. The Campaign ID will auto-populate in **B9**

### Run Analysis
1. Click **'META Reach Tool > 2. Run Analysis'**
2. The script will process each selected analysis level
3. Data will populate in separate output sheets:
   - **DATA_Account_Output**: Account-level metrics with demographic breakdowns
   - **DATA_Campaign_Output**: Campaign-level metrics with demographic breakdowns
   - **DATA_Ad_Output**: Ad-level metrics with demographic breakdowns

---

## Understanding the Output

### Data Structure
Each output sheet contains **flat table data** optimized for analysis in tools like Looker Studio or Excel pivot tables.

### Row Structure
For each time period, you'll see:
1. **One "TOTAL" row**: Aggregated metrics across all demographics
2. **Multiple demographic rows**: One row per age/gender combination (e.g., "25-34_male", "35-44_female", etc.)

Only demographics with data will appear in the output.

### Example Output Rows
```
Start Date  | End Date   | Level ID     | Level Name         | Demographic | Period Spend | Period Reach | ...
2024-10-01  | 2024-10-01 | act_12345    | Account Level Total| TOTAL       | 500.00      | 10000       | ...
2024-10-01  | 2024-10-01 | act_12345    | Account Level Total| 25-34_male  | 150.00      | 3000        | ...
2024-10-01  | 2024-10-01 | act_12345    | Account Level Total| 25-34_female| 200.00      | 3500        | ...
2024-10-01  | 2024-10-01 | act_12345    | Account Level Total| 35-44_male  | 100.00      | 2000        | ...
```

### Demographic Codes
Demographics are formatted as `{age_range}_{gender}`:
- Age ranges: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- Genders: male, female, unknown
- Examples: `25-34_male`, `45-54_female`, `18-24_unknown`

---

## Analysis Types Explained

### Daily
- Analyzes each calendar day as a separate period
- Best for: Granular day-by-day performance tracking
- Includes: Period metrics, rolling reach, and incremental reach

### 7-Day Interval
- Analyzes performance in 7-day blocks
- Best for: Weekly performance reviews and trends
- Includes: Period metrics, rolling reach, and incremental reach

### 28-Day Interval
- Analyzes performance in 28-day blocks
- Best for: Monthly-style reporting and long-term trends
- Includes: Period metrics, rolling reach, and incremental reach

### Daily with 28-Day Rolling
- Daily analysis with additional 28-day rolling window metrics
- Best for: Understanding sustained reach growth and audience saturation
- Includes: All daily metrics PLUS 28-day rolling reach and 28-day incremental reach
- Use case: Track how effectively you're reaching new users over a consistent 28-day window

**Note**: The 28-day rolling metric calculates incremental reach by comparing:
- **Y**: Total reach from (Date - 27 days) to Date
- **X**: Total reach from (Date - 27 days) to (Date - 1)
- **28-Day Incremental**: Y - X = New users reached on that specific date within the 28-day context

---

## Sheet Setup

### Setup Sheet
Your main control panel for configuring report parameters and triggering scripts.
**Important**: Changing the locations of cells B2-B13 will break the script.

### DATA_Campaigns Sheet
Helper sheet populated with campaign list. Powers the **'Select Campaign'** dropdown in B8.

### Output Sheets (Auto-Created)
- **DATA_Account_Output**: Account-level analysis results
- **DATA_Campaign_Output**: Campaign-level analysis results
- **DATA_Ad_Output**: Ad-level analysis results

These sheets are automatically created if they don't exist and are cleared/overwritten each time you run an analysis.

---

## Tips for Success

### Optimize for Reach Strategy
- Use demographic breakdowns to identify which age/gender segments are most efficiently reached
- Compare Period CPMr across demographics to find cost-effective audience segments
- Monitor 28-Day Rolling Incremental Reach to track audience saturation
- Look for demographics with high reach but low conversion rates (opportunity for creative refinement)

### Data Analysis Best Practices
- Export output sheets to Looker Studio for dynamic visualization
- Use pivot tables to compare demographics or time periods
- Track Incremental Reach trends to identify when you're reaching saturated audiences
- Compare ROAS across demographics to understand which audiences convert best

### Performance Considerations
- Ad-level analysis can take significant time for accounts with many ads
- Each API call includes a 500ms delay to respect rate limits
- For large date ranges with daily analysis, expect longer processing times
- Consider running analyses during off-peak hours for large datasets

### Troubleshooting
- If you see "API Error", verify your access token is valid and has proper permissions
- Ensure your token has access to the ad account specified in B2
- For campaign-specific analysis, make sure you've run "Get Campaigns" first
- Check that date ranges are valid (end date must be after start date)

---

## Advanced Use Cases

### Multi-Campaign Comparison
1. Run Campaign-level analysis for first campaign
2. Copy data from DATA_Campaign_Output to a new sheet
3. Select different campaign in Setup
4. Run Campaign-level analysis again
5. Copy new data below previous data
6. Analyze multiple campaigns side-by-side

### Demographic-First Creative Strategy
1. Run Daily with 28-Day Rolling at Account level
2. Identify demographics with declining 28-Day Incremental Reach (audience saturation)
3. Create new creative specifically targeting those demographics
4. Run Campaign-level analysis on the new campaign
5. Compare demographic performance between campaigns

### Ad Creative Testing
1. Run Ad-level analysis for "All Campaigns"
2. Export to spreadsheet/Looker Studio
3. Sort by Period CPMr (ascending) to find most efficient ads
4. Analyze demographic breakdowns of top-performing ads
5. Identify creative patterns that resonate with specific demographics

---

## API & Data Notes

### Meta Marketing API
- Uses Meta Graph API v20.0
- Pulls data from the Marketing Insights API endpoint
- Breakdowns: `['age', 'gender']`
- Fields: `reach`, `impressions`, `spend`, `actions`, `action_values`

### Conversion Tracking
- Conversions are extracted from the `offsite_conversion.fb_pixel_purchase` action type
- Revenue is extracted from the corresponding `action_values`
- Ensure your Meta Pixel is properly configured for purchase tracking
- If you don't see conversion data, verify Pixel events are firing correctly

### Data Accuracy
- Meta's deduplication means reach metrics are unique users
- Demographic data may not sum to exactly 100% due to "unknown" categories
- Small discrepancies between "TOTAL" rows and demographic sums can occur due to API rounding
- Revenue tracking depends on proper Pixel configuration and attribution windows

---

## Future Enhancements

Potential features for future versions:
- Custom action type selection (beyond purchase events)
- Placement breakdowns (Feed, Stories, Reels, etc.)
- Device breakdowns (Mobile, Desktop)
- Historical comparison reports
- Automated scheduling and emailing
- Integration with other platforms (Google Ads, TikTok)

---

## Support & Contributions

This is an open-source project. Feel free to:
- Fork and modify for your needs
- Submit pull requests with improvements
- Share feedback and use cases
- Report bugs via GitHub Issues

**Contact**: Kevin Luby - [@luby_k](https://x.com/luby_k) on X/Twitter

---

## Version History

### V2.0 (2025)
- Added demographic breakdowns (age/gender)
- Added ad-level analysis
- Added 28-day rolling incremental reach metrics
- Added conversion and revenue tracking
- Added multi-level checkbox execution
- Separated output into three sheets (Account/Campaign/Ad)
- Enhanced metrics: CPMr, CPA, ROAS, 28-Day CPMi

### V2.2 (2024)
- Original release with account and campaign-level analysis
- Basic reach, impressions, frequency metrics
- Daily, 7-day, and 28-day interval options

---

**Built with ❤️ for marketers who believe in the power of creative-first advertising**
