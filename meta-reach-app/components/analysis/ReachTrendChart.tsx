'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Metric {
  periodStart: Date;
  periodEnd: Date;
  rollingReach: number;
  incrementalReach: number;
}

interface ReachTrendChartProps {
  metrics: Metric[];
}

export function ReachTrendChart({ metrics }: ReachTrendChartProps) {
  const data = metrics.map((metric) => ({
    date: format(new Date(metric.periodStart), 'MMM d'),
    rollingReach: metric.rollingReach,
    incrementalReach: metric.incrementalReach,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => value.toLocaleString()}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="rollingReach"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Rolling Reach"
        />
        <Line
          type="monotone"
          dataKey="incrementalReach"
          stroke="#10b981"
          strokeWidth={2}
          name="Incremental Reach"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

