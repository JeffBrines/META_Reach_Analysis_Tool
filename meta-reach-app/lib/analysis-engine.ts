import { MetaAPI } from './meta-api';
import { AnalysisLevel, IntervalType } from '@prisma/client';

// Demographic age/gender combinations
const DEMOGRAPHICS = [
  '13-17_male', '13-17_female', '13-17_unknown',
  '18-24_male', '18-24_female', '18-24_unknown',
  '25-34_male', '25-34_female', '25-34_unknown',
  '35-44_male', '35-44_female', '35-44_unknown',
  '45-54_male', '45-54_female', '45-54_unknown',
  '55-64_male', '55-64_female', '55-64_unknown',
  '65+_male', '65+_female', '65+_unknown',
];

export interface AnalysisConfig {
  metaAccountId: string;
  level: AnalysisLevel;
  entityId?: string; // Campaign or Ad ID
  entityName?: string;
  dateStart: Date;
  dateEnd: Date;
  intervalType: IntervalType;
  includeDemographics: boolean;
}

export interface MetricRow {
  periodStart: Date;
  periodEnd: Date;
  demographic: string; // 'TOTAL' or '25-34_male', etc.
  
  // Core metrics
  periodSpend: number;
  periodReach: number;
  periodImpressions: number;
  periodConversions: number;
  periodRevenue: number;
  
  // Calculated metrics
  periodFrequency: number;
  periodCPM: number;
  periodCPMr: number;
  periodCPA: number | null;
  periodROAS: number | null;
  rollingReach: number;
  cumulativeImpressions: number;
  rollingFrequency: number;
  incrementalReach: number;
  cpim: number | null;
  
  // 28-day rolling (nullable)
  rolling28Reach: number | null;
  rolling28IncrementalReach: number | null;
  rolling28CPMi: number | null;
}

interface ParsedDemographicData {
  [key: string]: {
    reach: number;
    impressions: number;
    spend: number;
    conversions: number;
    revenue: number;
  };
}

class DemographicTracker {
  private tracker: Map<string, number> = new Map();

  get(demographic: string): number {
    return this.tracker.get(demographic) || 0;
  }

  set(demographic: string, value: number): void {
    this.tracker.set(demographic, value);
  }
}

export class AnalysisEngine {
  private metaApi: MetaAPI;

  constructor(accessToken: string) {
    this.metaApi = new MetaAPI(accessToken);
  }

  /**
   * Run complete analysis
   */
  async runAnalysis(config: AnalysisConfig): Promise<MetricRow[]> {
    const periods = this.generatePeriods(config);
    const results: MetricRow[] = [];
    const tracker = new DemographicTracker();
    const isRolling28 = config.intervalType === 'DAILY_ROLLING_28';
    
    const entityId = config.level === 'ACCOUNT'
      ? config.metaAccountId
      : config.entityId!;
    
    const level = config.level === 'ACCOUNT' ? 'account' : undefined;

    for (const period of periods) {
      // Fetch period data with demographics
      const periodDataRaw = await this.metaApi.getInsights(entityId, {
        level,
        time_range: {
          since: this.formatDate(period.start),
          until: this.formatDate(period.end),
        },
        fields: 'reach,impressions,spend,actions,action_values',
        breakdowns: config.includeDemographics ? ['age', 'gender'] : undefined,
      });

      // Fetch cumulative data
      const cumulativeDataRaw = await this.metaApi.getInsights(entityId, {
        level,
        time_range: {
          since: this.formatDate(config.dateStart),
          until: this.formatDate(period.end),
        },
        fields: 'reach,impressions',
        breakdowns: config.includeDemographics ? ['age', 'gender'] : undefined,
      });

      let rolling28DataRaw = null;
      let rolling28PrevDataRaw = null;

      if (isRolling28) {
        const rolling28StartDate = new Date(period.end);
        rolling28StartDate.setDate(rolling28StartDate.getDate() - 27);

        const rolling28PrevEndDate = new Date(period.end);
        rolling28PrevEndDate.setDate(rolling28PrevEndDate.getDate() - 1);

        // Y: Current 28-day reach
        rolling28DataRaw = await this.metaApi.getInsights(entityId, {
          level,
          time_range: {
            since: this.formatDate(rolling28StartDate),
            until: this.formatDate(period.end),
          },
          fields: 'reach',
          breakdowns: config.includeDemographics ? ['age', 'gender'] : undefined,
        });

        // X: Previous 28-day reach
        rolling28PrevDataRaw = await this.metaApi.getInsights(entityId, {
          level,
          time_range: {
            since: this.formatDate(rolling28StartDate),
            until: this.formatDate(rolling28PrevEndDate),
          },
          fields: 'reach',
          breakdowns: config.includeDemographics ? ['age', 'gender'] : undefined,
        });

        await this.metaApi.sleep(300);
      }

      // Parse demographic data
      const periodData = this.parseDemographicData(periodDataRaw.data);
      const cumulativeData = this.parseDemographicData(cumulativeDataRaw.data);
      const rolling28Data = rolling28DataRaw
        ? this.parseDemographicData(rolling28DataRaw.data)
        : null;
      const rolling28PrevData = rolling28PrevDataRaw
        ? this.parseDemographicData(rolling28PrevDataRaw.data)
        : null;

      // Calculate totals
      const totalRow = this.calculateTotalRow(
        periodData,
        cumulativeData,
        rolling28Data,
        rolling28PrevData,
        tracker,
        'TOTAL',
        period.start,
        period.end,
        isRolling28
      );
      results.push(totalRow);

      // Calculate demographic rows if requested
      if (config.includeDemographics) {
        for (const demo of DEMOGRAPHICS) {
          const demoRow = this.calculateDemographicRow(
            periodData,
            cumulativeData,
            rolling28Data,
            rolling28PrevData,
            tracker,
            demo,
            period.start,
            period.end,
            isRolling28
          );

          if (demoRow) {
            results.push(demoRow);
          }
        }
      }

      // Rate limiting
      await this.metaApi.sleep(500);
    }

    return results;
  }

  /**
   * Generate time periods based on interval type
   */
  private generatePeriods(config: AnalysisConfig): Array<{ start: Date; end: Date }> {
    const periods: Array<{ start: Date; end: Date }> = [];
    const { dateStart, dateEnd, intervalType } = config;

    let lookbackDays: number;
    switch (intervalType) {
      case 'DAILY':
      case 'DAILY_ROLLING_28':
        lookbackDays = 1;
        break;
      case 'WEEKLY':
        lookbackDays = 7;
        break;
      case 'MONTHLY':
        lookbackDays = 28;
        break;
    }

    let current = new Date(dateStart);
    while (current <= dateEnd) {
      const periodStart = new Date(current);
      let periodEnd = new Date(current);
      periodEnd.setDate(periodEnd.getDate() + lookbackDays - 1);

      if (periodEnd > dateEnd) {
        periodEnd = new Date(dateEnd);
      }

      periods.push({ start: periodStart, end: periodEnd });

      current.setDate(current.getDate() + lookbackDays);
    }

    return periods;
  }

  /**
   * Parse demographic data from Meta API response
   */
  private parseDemographicData(apiData: any[]): ParsedDemographicData {
    const result: ParsedDemographicData = {};

    if (!apiData || apiData.length === 0) {
      return result;
    }

    for (const item of apiData) {
      const age = item.age || 'unknown';
      const gender = item.gender || 'unknown';
      const demoKey = `${age}_${gender}`;

      result[demoKey] = {
        reach: parseInt(item.reach || '0'),
        impressions: parseInt(item.impressions || '0'),
        spend: parseFloat(item.spend || '0'),
        conversions: this.getActionValue(
          item.actions,
          'offsite_conversion.fb_pixel_purchase'
        ),
        revenue: this.getActionValue(
          item.action_values,
          'offsite_conversion.fb_pixel_purchase'
        ),
      };
    }

    return result;
  }

  /**
   * Calculate total row aggregating all demographics
   */
  private calculateTotalRow(
    periodData: ParsedDemographicData,
    cumulativeData: ParsedDemographicData,
    rolling28Data: ParsedDemographicData | null,
    rolling28PrevData: ParsedDemographicData | null,
    tracker: DemographicTracker,
    demographic: string,
    periodStart: Date,
    periodEnd: Date,
    isRolling28: boolean
  ): MetricRow {
    // Aggregate across all demographics
    let periodSpend = 0,
      periodReach = 0,
      periodImpressions = 0,
      periodConversions = 0,
      periodRevenue = 0;
    let rollingReach = 0,
      cumulativeImpressions = 0;
    let rolling28Reach = 0,
      rolling28PrevReach = 0;

    for (const demo in periodData) {
      periodSpend += periodData[demo].spend;
      periodReach += periodData[demo].reach;
      periodImpressions += periodData[demo].impressions;
      periodConversions += periodData[demo].conversions;
      periodRevenue += periodData[demo].revenue;
    }

    for (const demo in cumulativeData) {
      rollingReach += cumulativeData[demo].reach;
      cumulativeImpressions += cumulativeData[demo].impressions;
    }

    if (isRolling28 && rolling28Data && rolling28PrevData) {
      for (const demo in rolling28Data) {
        rolling28Reach += rolling28Data[demo].reach;
      }
      for (const demo in rolling28PrevData) {
        rolling28PrevReach += rolling28PrevData[demo].reach;
      }
    }

    return this.calculateMetrics(
      periodSpend,
      periodReach,
      periodImpressions,
      periodConversions,
      periodRevenue,
      rollingReach,
      cumulativeImpressions,
      rolling28Reach,
      rolling28PrevReach,
      tracker,
      demographic,
      periodStart,
      periodEnd,
      isRolling28
    );
  }

  /**
   * Calculate row for specific demographic
   */
  private calculateDemographicRow(
    periodData: ParsedDemographicData,
    cumulativeData: ParsedDemographicData,
    rolling28Data: ParsedDemographicData | null,
    rolling28PrevData: ParsedDemographicData | null,
    tracker: DemographicTracker,
    demographic: string,
    periodStart: Date,
    periodEnd: Date,
    isRolling28: boolean
  ): MetricRow | null {
    const periodMetrics = periodData[demographic] || {
      reach: 0,
      impressions: 0,
      spend: 0,
      conversions: 0,
      revenue: 0,
    };
    const cumulativeMetrics = cumulativeData[demographic] || {
      reach: 0,
      impressions: 0,
    };

    // Skip if no data
    if (
      periodMetrics.reach === 0 &&
      periodMetrics.impressions === 0 &&
      cumulativeMetrics.reach === 0
    ) {
      return null;
    }

    const rolling28Reach =
      rolling28Data && rolling28Data[demographic]
        ? rolling28Data[demographic].reach
        : 0;
    const rolling28PrevReach =
      rolling28PrevData && rolling28PrevData[demographic]
        ? rolling28PrevData[demographic].reach
        : 0;

    return this.calculateMetrics(
      periodMetrics.spend,
      periodMetrics.reach,
      periodMetrics.impressions,
      periodMetrics.conversions,
      periodMetrics.revenue,
      cumulativeMetrics.reach,
      cumulativeMetrics.impressions,
      rolling28Reach,
      rolling28PrevReach,
      tracker,
      demographic,
      periodStart,
      periodEnd,
      isRolling28
    );
  }

  /**
   * Calculate all derived metrics
   */
  private calculateMetrics(
    periodSpend: number,
    periodReach: number,
    periodImpressions: number,
    periodConversions: number,
    periodRevenue: number,
    rollingReach: number,
    cumulativeImpressions: number,
    rolling28Reach: number,
    rolling28PrevReach: number,
    tracker: DemographicTracker,
    demographic: string,
    periodStart: Date,
    periodEnd: Date,
    isRolling28: boolean
  ): MetricRow {
    // Calculate derived metrics
    const periodFrequency =
      periodReach > 0 ? periodImpressions / periodReach : 0;
    const periodCPM =
      periodImpressions > 0 ? (periodSpend / periodImpressions) * 1000 : 0;
    const periodCPMr = periodReach > 0 ? (periodSpend / periodReach) * 1000 : 0;
    const periodCPA =
      periodConversions > 0 ? periodSpend / periodConversions : null;
    const periodROAS = periodSpend > 0 ? periodRevenue / periodSpend : null;

    const rollingFrequency =
      rollingReach > 0 ? cumulativeImpressions / rollingReach : 0;

    const previousRollingReach = tracker.get(demographic);
    const incrementalReach = rollingReach - previousRollingReach;
    const cpim = incrementalReach > 0 ? (periodSpend / incrementalReach) * 1000 : null;

    tracker.set(demographic, rollingReach);

    let rolling28IncrementalReach: number | null = null;
    let rolling28CPMi: number | null = null;

    if (isRolling28) {
      rolling28IncrementalReach = rolling28Reach - rolling28PrevReach;
      rolling28CPMi =
        rolling28IncrementalReach > 0
          ? (periodSpend / rolling28IncrementalReach) * 1000
          : null;
    }

    return {
      periodStart,
      periodEnd,
      demographic,
      periodSpend,
      periodReach,
      periodImpressions,
      periodConversions,
      periodRevenue,
      periodFrequency,
      periodCPM,
      periodCPMr,
      periodCPA,
      periodROAS,
      rollingReach,
      cumulativeImpressions,
      rollingFrequency,
      incrementalReach,
      cpim,
      rolling28Reach: isRolling28 ? rolling28Reach : null,
      rolling28IncrementalReach,
      rolling28CPMi,
    };
  }

  /**
   * Extract action value from Meta API actions array
   */
  private getActionValue(actionsArray: any[] | undefined, actionType: string): number {
    if (!actionsArray || !Array.isArray(actionsArray)) {
      return 0;
    }

    for (const action of actionsArray) {
      if (action.action_type === actionType) {
        return parseFloat(action.value || '0');
      }
    }

    return 0;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}


