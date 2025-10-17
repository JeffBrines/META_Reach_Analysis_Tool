'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface Metric {
  periodStart: Date;
  periodEnd: Date;
  cpim: number | null;
  periodCPMr: number;
}

interface CPMiTrendChartProps {
  metrics: Metric[];
}

export function CPMiTrendChart({ metrics }: CPMiTrendChartProps) {
  const data = metrics.map((metric) => ({
    date: format(new Date(metric.periodStart), 'MMM d'),
    cpim: metric.cpim,
    cpmr: metric.periodCPMr,
  }));

  // Calculate average CPMr for reference line
  const avgCPMr = metrics.reduce((sum, m) => sum + m.periodCPMr, 0) / metrics.length;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} />
        <Tooltip
          formatter={(value: number | null) => 
            value !== null ? `$${value.toFixed(2)}` : '-'
          }
          labelStyle={{ color: '#000' }}
        />
        <ReferenceLine 
          y={avgCPMr} 
          stroke="#9ca3af" 
          strokeDasharray="5 5"
          label={{ value: 'Avg CPMr', position: 'right', fill: '#9ca3af' }}
        />
        <Line
          type="monotone"
          dataKey="cpim"
          stroke="#ef4444"
          strokeWidth={2}
          name="CPMi (Incremental)"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="cpmr"
          stroke="#3b82f6"
          strokeWidth={2}
          name="CPMr (Period)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

