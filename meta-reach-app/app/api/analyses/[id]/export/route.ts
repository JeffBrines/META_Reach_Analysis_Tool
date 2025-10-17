import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysisId = params.id;
    const formatType = request.nextUrl.searchParams.get('format') || 'csv';

    // Get analysis with access check
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        account: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        metrics: {
          orderBy: [
            { periodStart: 'asc' },
            { demographic: 'asc' },
          ],
        },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    if (formatType === 'csv') {
      return exportAsCSV(analysis);
    } else if (formatType === 'pdf') {
      return exportAsPDF(analysis);
    } else {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analysis' },
      { status: 500 }
    );
  }
}

function exportAsCSV(analysis: any) {
  const isRolling28 = analysis.intervalType === 'DAILY_ROLLING_28';

  // Build CSV header
  const headers = [
    'Start Date',
    'End Date',
    'Demographic',
    'Period Spend',
    'Period Reach',
    'Period Impressions',
    'Period Conversions',
    'Period Revenue',
    'Period Frequency',
    'Period CPM',
    'Period CPMr',
    'Period CPA',
    'Period ROAS',
    'Rolling Reach',
    'Cumulative Impressions',
    'Rolling Frequency',
    'Incremental Reach',
    'CPMi',
  ];

  if (isRolling28) {
    headers.push('28-Day Rolling Reach', '28-Day Incremental Reach', '28-Day CPMi');
  }

  // Build CSV rows
  const rows = analysis.metrics.map((metric: any) => {
    const row = [
      format(new Date(metric.periodStart), 'yyyy-MM-dd'),
      format(new Date(metric.periodEnd), 'yyyy-MM-dd'),
      metric.demographic,
      metric.periodSpend,
      metric.periodReach,
      metric.periodImpressions,
      metric.periodConversions,
      metric.periodRevenue,
      metric.periodFrequency,
      metric.periodCPM,
      metric.periodCPMr,
      metric.periodCPA || '',
      metric.periodROAS || '',
      metric.rollingReach,
      metric.cumulativeImpressions,
      metric.rollingFrequency,
      metric.incrementalReach,
      metric.cpim || '',
    ];

    if (isRolling28) {
      row.push(
        metric.rolling28Reach || '',
        metric.rolling28IncrementalReach || '',
        metric.rolling28CPMi || ''
      );
    }

    return row;
  });

  // Combine into CSV string
  const csv = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analysis-${analysis.id}.csv"`,
    },
  });
}

function exportAsPDF(analysis: any) {
  // Simple PDF generation (HTML-based)
  // For production, consider using a library like jsPDF or Puppeteer
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .total-row { background-color: #fef3c7; font-weight: bold; }
  </style>
</head>
<body>
  <h1>META Reach Analysis Report</h1>
  <p><strong>Analysis Name:</strong> ${analysis.name || 'Unnamed'}</p>
  <p><strong>Date Range:</strong> ${format(new Date(analysis.dateStart), 'MMM d, yyyy')} - ${format(new Date(analysis.dateEnd), 'MMM d, yyyy')}</p>
  <p><strong>Level:</strong> ${analysis.level}</p>
  <p><strong>Interval:</strong> ${analysis.intervalType}</p>
  
  <table>
    <thead>
      <tr>
        <th>Start Date</th>
        <th>Demographic</th>
        <th>Reach</th>
        <th>Impressions</th>
        <th>Spend</th>
        <th>CPMr</th>
        <th>CPMi</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.metrics.map((m: any) => `
        <tr class="${m.demographic === 'TOTAL' ? 'total-row' : ''}">
          <td>${format(new Date(m.periodStart), 'MMM d')}</td>
          <td>${m.demographic}</td>
          <td>${m.periodReach.toLocaleString()}</td>
          <td>${m.periodImpressions.toLocaleString()}</td>
          <td>$${m.periodSpend.toFixed(2)}</td>
          <td>$${m.periodCPMr.toFixed(2)}</td>
          <td>${m.cpim ? '$' + m.cpim.toFixed(2) : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="analysis-${analysis.id}.pdf"`,
    },
  });
}

