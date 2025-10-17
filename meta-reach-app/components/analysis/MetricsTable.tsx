'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Metric {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  demographic: string;
  periodSpend: number;
  periodReach: number;
  periodImpressions: number;
  periodConversions: number;
  periodRevenue: number;
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
  rolling28Reach: number | null;
  rolling28IncrementalReach: number | null;
  rolling28CPMi: number | null;
}

interface MetricsTableProps {
  metrics: Metric[];
  intervalType: string;
}

export function MetricsTable({ metrics, intervalType }: MetricsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('periodStart');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isRolling28 = intervalType === 'DAILY_ROLLING_28';

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => {
    const aVal = (a as any)[sortColumn];
    const bVal = (b as any)[sortColumn];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString();
  };

  const formatDecimal = (value: number | null, decimals: number = 2) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(decimals);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort('periodStart')}>
              Start Date
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('periodEnd')}>
              End Date
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('demographic')}>
              Demographic
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodSpend')}>
              Spend
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodReach')}>
              Reach
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodImpressions')}>
              Impressions
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodConversions')}>
              Conversions
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodRevenue')}>
              Revenue
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodFrequency')}>
              Frequency
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodCPM')}>
              CPM
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodCPMr')}>
              CPMr
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodCPA')}>
              CPA
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('periodROAS')}>
              ROAS
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('rollingReach')}>
              Rolling Reach
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('incrementalReach')}>
              Incremental Reach
            </TableHead>
            <TableHead className="text-right cursor-pointer" onClick={() => handleSort('cpim')}>
              CPMi
            </TableHead>
            {isRolling28 && (
              <>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('rolling28Reach')}>
                  28d Rolling Reach
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('rolling28IncrementalReach')}>
                  28d Incremental
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('rolling28CPMi')}>
                  28d CPMi
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMetrics.map((metric) => (
            <TableRow key={metric.id} className={metric.demographic === 'TOTAL' ? 'font-semibold bg-gray-50' : ''}>
              <TableCell>{format(new Date(metric.periodStart), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(metric.periodEnd), 'MMM d, yyyy')}</TableCell>
              <TableCell>{metric.demographic}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.periodSpend)}</TableCell>
              <TableCell className="text-right">{formatNumber(metric.periodReach)}</TableCell>
              <TableCell className="text-right">{formatNumber(metric.periodImpressions)}</TableCell>
              <TableCell className="text-right">{formatNumber(metric.periodConversions)}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.periodRevenue)}</TableCell>
              <TableCell className="text-right">{formatDecimal(metric.periodFrequency)}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.periodCPM)}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.periodCPMr)}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.periodCPA)}</TableCell>
              <TableCell className="text-right">{formatDecimal(metric.periodROAS)}</TableCell>
              <TableCell className="text-right">{formatNumber(metric.rollingReach)}</TableCell>
              <TableCell className="text-right">{formatNumber(metric.incrementalReach)}</TableCell>
              <TableCell className="text-right">{formatCurrency(metric.cpim)}</TableCell>
              {isRolling28 && (
                <>
                  <TableCell className="text-right">{formatNumber(metric.rolling28Reach)}</TableCell>
                  <TableCell className="text-right">{formatNumber(metric.rolling28IncrementalReach)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(metric.rolling28CPMi)}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sortedMetrics.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No metrics available
        </div>
      )}
    </div>
  );
}

