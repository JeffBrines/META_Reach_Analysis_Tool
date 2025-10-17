const META_GRAPH_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface MetaInsightsParams {
  level?: 'account' | 'campaign' | 'ad';
  time_range: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  fields: string;
  breakdowns?: string[];
  filtering?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  limit?: number;
}

export interface MetaInsightsResponse {
  data: Array<{
    reach?: string;
    impressions?: string;
    spend?: string;
    age?: string;
    gender?: string;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
    action_values?: Array<{
      action_type: string;
      value: string;
    }>;
  }>;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export class MetaAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch insights for an account, campaign, or ad
   */
  async getInsights(
    entityId: string,
    params: MetaInsightsParams
  ): Promise<MetaInsightsResponse> {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    if (params.level) queryParams.append('level', params.level);
    queryParams.append('fields', params.fields);
    queryParams.append('time_range', JSON.stringify(params.time_range));

    if (params.breakdowns && params.breakdowns.length > 0) {
      queryParams.append('breakdowns', params.breakdowns.join(','));
    }

    if (params.filtering) {
      queryParams.append('filtering', JSON.stringify(params.filtering));
    }

    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${BASE_URL}/${entityId}/insights?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Meta API error: ${error.error?.message || 'Unknown error'} (Code: ${
          error.error?.code || response.status
        })`
      );
    }

    return response.json();
  }

  /**
   * Fetch campaigns with spend
   */
  async getCampaigns(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ id: string; name: string }>> {
    const queryParams = new URLSearchParams({
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      filtering: JSON.stringify([
        { field: 'spend', operator: 'GREATER_THAN', value: 0 },
      ]),
      fields: 'name,id',
      limit: '500',
    });

    const url = `${BASE_URL}/${accountId}/campaigns?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Meta API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Fetch ads with spend
   */
  async getAds(
    entityId: string, // Account or Campaign ID
    startDate: string,
    endDate: string
  ): Promise<Array<{ id: string; name: string }>> {
    const queryParams = new URLSearchParams({
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      filtering: JSON.stringify([
        { field: 'spend', operator: 'GREATER_THAN', value: 0 },
      ]),
      fields: 'name,id',
      limit: '500',
    });

    const url = `${BASE_URL}/${entityId}/ads?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Meta API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Test connection to verify token is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/me?access_token=${this.accessToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


