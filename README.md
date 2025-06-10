# META Marketing API - Reach Analysis Tool for Google Sheets

---

This tool, **v2.2**, was developed by Kevin Luby ([@luby_k](https://x.com/luby_k))/[LinkedIn](https://www.linkedin.com/in/kevin-luby-70b62445/), Director of Ecom at High Camp Flasks. It was developed with the assistance of Gemini 2.5 Pro. 

---
## CREATOR NOTE: 
This tool was 100% vibe coded with Gemini 2.5 Pro. While I'm an above average technical person, I don't know how to write code from scratch, or 'check the work' of the LLM that wrote this script. I did work with it to ensure some level of security (see API token below). This script doesn't do anything groundbreaking. It just makes calls to the META Marketing Insights API. That said...
**Use this tool at your own risk**

## Overview

This script offers a comprehensive framework for analyzing Meta Ads performance by directly pulling data from the Marketing API. It generates a detailed report that combines metrics from specific time intervals (e.g., weekly) with overall cumulative growth metrics.

---
## Key Links
[Video Walkthrough Of Tool](https://highcampflasks.neetorecord.com/watch/77b3a72aba0e88855fa4)
[Base tool spreadsheet template](https://docs.google.com/spreadsheets/d/1_iONm4-WlSOJ5cySHrshIwoHKGIF7nXrNkBwmwKePFE/edit?usp=sharing)

## Key Features

* **Analysis Scope**: Choose between a de-duplicated, account-level view (**'All Campaigns'**) or a detailed analysis of a single campaign (**'Specific Campaign'**).
* **Interval Reporting**: Analyze performance in distinct blocks of time. You can select **'Daily'**, **'7-Day Interval'**, or **'28-Day Interval'**.
* **Rich Calculated Metrics**: The tool automatically calculates key performance indicators. See the **Metrics Glossary** below for detailed calculations.
* **Color-Coded Status**: The status cell in the **'Setup'** sheet changes color to indicate the script's current state (**In Progress**, **Success**, or **Error**).

---

## Metrics Glossary

* **Start Date/End Date**: The start/end date of the specific interval block for the data in this row.
* **Campaign ID/Name**: The entity being analyzed (either the ad account or a specific campaign).
* **Period Spend**: Total ad spend during this specific period.
* **Period Reach**: Unique users reached during this specific period.
* **Period Impressions**: Total impressions during this specific period.
* **Period Frequency**: (Period Impressions / Period Reach) for this period.
* **Period CPmR**: Cost per 1,000 Users Reached. ($\text{Period Spend} / \text{Period Reach} * 1000$)
* **Period CPM**: Cost per 1,000 Impressions. ($\text{Period Spend} / \text{Period Impressions} * 1000$)
* **Rolling Reach**: Total unique users reached from the overall Start Date up to this period's End Date.
* **Cumulative Impressions**: Total impressions from the overall Start Date up to this period's End Date.
* **Rolling Frequency**: ($\text{Cumulative Impressions} / \text{Rolling Reach}$).
* **Incremental Reach**: New unique users reached in this period compared to the previous period's Rolling Reach.
* **CPiM**: Cost Per Incremental 1,000 Users Reached. ($\text{Period Spend} / \text{Incremental Reach} * 1000$).

---

## How to Use (Workflow)

1.  **Initial Setup**: On first use, run **'META Reach Tool > Set/Update Access Token'** from the menu and enter a valid long-lived user access token. For security, this will store your API token in 'PropertiesService'.
2.  **Configure Report**: Fill out the parameters on the **'Setup'** sheet:
    * Ad Account ID (formatted: `act_XXXXXXXXXXXX`)
    * Start/End Date
    * Analysis Type
    * Analysis Scope
3.  **(Optional) Get Campaigns**: If using the **'Specific Campaign'** scope, run **'META Reach Tool > 1. Get Campaigns with Spend'**. This populates the dropdown in cell B8.
4.  **(Optional) Select Campaign**: If using the **'Specific Campaign'** scope, select your desired campaign from the dropdown in B8. The Campaign ID will auto-populate.
5.  **Run Analysis**: Run **'META Reach Tool > 2. Run Analysis'**. The script will generate the report in the **'DATA_RollingReach'** sheet based on your settings.

---

## Sheet Setup

* **Setup**: This is your main control panel for configuring report parameters and triggering the scripts. **Note: Changing the locations of cells in the 'setup' section will break the script.**
* **DATA\_Campaigns**: A helper sheet populated with a list of campaigns. This list powers the **'Select Campaign'** dropdown.
* **DATA\_reachTool\_flatTable\_Output**: The final destination for the analysis report. This sheet is cleared and overwritten each time the analysis is run.
