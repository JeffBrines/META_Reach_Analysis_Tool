'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Loader2, Play } from 'lucide-react';

interface MetaAccount {
  id: string;
  metaAccountId: string;
  metaAccountName: string | null;
}

interface Campaign {
  id: string;
  name: string;
}

interface Ad {
  id: string;
  name: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  
  // Form state
  const [metaAccounts, setMetaAccounts] = useState<MetaAccount[]>([]);
  const [selectedMetaAccount, setSelectedMetaAccount] = useState('');
  const [analysisLevel, setAnalysisLevel] = useState<'ACCOUNT' | 'CAMPAIGN' | 'AD'>('ACCOUNT');
  const [intervalType, setIntervalType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'DAILY_ROLLING_28'>('DAILY');
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analysisName, setAnalysisName] = useState('');
  
  // Campaign/Ad selection
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedCampaignName, setSelectedCampaignName] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState('');
  const [selectedAdName, setSelectedAdName] = useState('');
  
  // Loading states
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch meta accounts on mount
  useEffect(() => {
    fetchMetaAccounts();
  }, []);

  // Fetch campaigns when meta account or dates change
  useEffect(() => {
    if (selectedMetaAccount && startDate && endDate && (analysisLevel === 'CAMPAIGN' || analysisLevel === 'AD')) {
      fetchCampaigns();
    }
  }, [selectedMetaAccount, startDate, endDate, analysisLevel]);

  // Fetch ads when campaign changes
  useEffect(() => {
    if (selectedCampaign && startDate && endDate && analysisLevel === 'AD') {
      fetchAds();
    }
  }, [selectedCampaign, startDate, endDate, analysisLevel]);

  const fetchMetaAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await fetch('/api/meta-accounts');
      const data = await response.json();
      setMetaAccounts(data.metaAccounts || []);
    } catch (err) {
      console.error('Error fetching meta accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch(
        `/api/meta/campaigns?metaAccountId=${selectedMetaAccount}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchAds = async () => {
    try {
      setLoadingAds(true);
      const metaAccount = metaAccounts.find(ma => ma.id === selectedMetaAccount);
      if (!metaAccount) return;
      
      const entityId = selectedCampaign; // Fetch ads for selected campaign
      const response = await fetch(
        `/api/meta/ads?metaAccountId=${selectedMetaAccount}&entityId=${entityId}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setAds(data.ads || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!selectedMetaAccount) {
        throw new Error('Please select a Meta account');
      }
      if (!startDate || !endDate) {
        throw new Error('Please select start and end dates');
      }
      if (analysisLevel === 'CAMPAIGN' && !selectedCampaign) {
        throw new Error('Please select a campaign');
      }
      if (analysisLevel === 'AD' && !selectedAd) {
        throw new Error('Please select an ad');
      }

      const payload = {
        metaAccountId: selectedMetaAccount,
        level: analysisLevel,
        entityId: analysisLevel === 'CAMPAIGN' ? selectedCampaign : analysisLevel === 'AD' ? selectedAd : null,
        entityName: analysisLevel === 'CAMPAIGN' ? selectedCampaignName : analysisLevel === 'AD' ? selectedAdName : null,
        dateStart: startDate,
        dateEnd: endDate,
        intervalType,
        includeDemographics,
        name: analysisName || null,
      };

      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create analysis');
      }

      const data = await response.json();
      
      // Redirect to analysis detail page
      router.push(`/dashboard/analyses/${data.analysis.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Analysis</h1>
        <p className="mt-2 text-gray-600">
          Configure your Meta reach analysis parameters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Configuration</CardTitle>
            <CardDescription>
              Set up your analysis parameters to track reach, impressions, and demographic performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Analysis Name */}
            <div className="space-y-2">
              <Label htmlFor="analysisName">Analysis Name (Optional)</Label>
              <Input
                id="analysisName"
                placeholder="Q4 Campaign Performance"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Meta Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="metaAccount">Meta Ad Account *</Label>
              {loadingAccounts ? (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading accounts...
                </div>
              ) : metaAccounts.length === 0 ? (
                <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                  No Meta accounts connected. Please connect a Meta account first.
                </div>
              ) : (
                <Select value={selectedMetaAccount} onValueChange={setSelectedMetaAccount} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Meta account" />
                  </SelectTrigger>
                  <SelectContent>
                    {metaAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.metaAccountName || account.metaAccountId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Analysis Level */}
            <div className="space-y-2">
              <Label htmlFor="level">Analysis Level *</Label>
              <Select value={analysisLevel} onValueChange={(value: any) => setAnalysisLevel(value)} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCOUNT">Account (All Campaigns)</SelectItem>
                  <SelectItem value="CAMPAIGN">Specific Campaign</SelectItem>
                  <SelectItem value="AD">Specific Ad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Campaign Selection (if CAMPAIGN or AD level) */}
            {(analysisLevel === 'CAMPAIGN' || analysisLevel === 'AD') && (
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign *</Label>
                {loadingCampaigns ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading campaigns...
                  </div>
                ) : campaigns.length === 0 && selectedMetaAccount && startDate && endDate ? (
                  <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    No campaigns found with spend in this date range
                  </div>
                ) : (
                  <Select 
                    value={selectedCampaign} 
                    onValueChange={(value) => {
                      setSelectedCampaign(value);
                      const campaign = campaigns.find(c => c.id === value);
                      setSelectedCampaignName(campaign?.name || '');
                    }}
                    disabled={submitting || campaigns.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Ad Selection (if AD level) */}
            {analysisLevel === 'AD' && selectedCampaign && (
              <div className="space-y-2">
                <Label htmlFor="ad">Ad *</Label>
                {loadingAds ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading ads...
                  </div>
                ) : ads.length === 0 ? (
                  <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    No ads found with spend in this date range
                  </div>
                ) : (
                  <Select 
                    value={selectedAd} 
                    onValueChange={(value) => {
                      setSelectedAd(value);
                      const ad = ads.find(a => a.id === value);
                      setSelectedAdName(ad?.name || '');
                    }}
                    disabled={submitting || ads.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ads.map((ad) => (
                        <SelectItem key={ad.id} value={ad.id}>
                          {ad.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Interval Type */}
            <div className="space-y-2">
              <Label htmlFor="interval">Interval Type *</Label>
              <Select value={intervalType} onValueChange={(value: any) => setIntervalType(value)} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">7-Day Interval</SelectItem>
                  <SelectItem value="MONTHLY">28-Day Interval</SelectItem>
                  <SelectItem value="DAILY_ROLLING_28">Daily with 28-Day Rolling</SelectItem>
                </SelectContent>
              </Select>
              {intervalType === 'DAILY_ROLLING_28' && (
                <p className="text-sm text-gray-600">
                  Tracks incremental reach with a floating 28-day lookback window
                </p>
              )}
            </div>

            {/* Include Demographics */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="demographics"
                checked={includeDemographics}
                onChange={(e) => setIncludeDemographics(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="demographics" className="cursor-pointer">
                Include demographic breakdowns (age × gender)
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting || !selectedMetaAccount || !startDate || !endDate || metaAccounts.length === 0}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/analyses')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

