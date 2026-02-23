'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet, Download, Calendar } from 'lucide-react';
import { toast } from '@/lib/apiToast';

// ===== COLOR THEME (Teal/Emerald) =====
const THEME = {
  primary: [13, 148, 136],
  primaryDark: [15, 118, 110],
  primaryLight: [204, 251, 241],
  accent: [16, 185, 129],
  accentLight: [209, 250, 229],
  headerText: [255, 255, 255],
  bodyText: [55, 65, 81],
  mutedText: [107, 114, 128],
  border: [209, 213, 219],
};

// ========================================
//  HELPER: Draw a styled table with jsPDF
// ========================================
function drawTable(doc, { startY, margin, pageWidth, pageHeight, head, body, colWidths, colAligns }) {
  const rowHeight = 10;
  const headerHeight = 12;
  const cellPadding = 4;
  const tableWidth = colWidths.reduce((s, w) => s + w, 0);
  let y = startY;

  const checkPageBreak = (needed) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Header row
  checkPageBreak(headerHeight);
  doc.setFillColor(...THEME.primary);
  doc.rect(margin, y, tableWidth, headerHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...THEME.headerText);

  let xOff = margin;
  head.forEach((text, i) => {
    const align = colAligns?.[i] || 'left';
    const tx = align === 'right' ? xOff + colWidths[i] - cellPadding : xOff + cellPadding;
    doc.text(String(text), tx, y + headerHeight / 2 + 1, {
      align: align === 'right' ? 'right' : (align === 'center' ? 'center' : 'left'),
      baseline: 'middle'
    });
    xOff += colWidths[i];
  });
  y += headerHeight;

  // Body rows
  doc.setFontSize(9);
  body.forEach((row, ri) => {
    checkPageBreak(rowHeight);

    // Alternate shading
    if (ri % 2 === 0) {
      doc.setFillColor(...THEME.primaryLight);
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
    }

    // Bottom border
    doc.setDrawColor(...THEME.border);
    doc.setLineWidth(0.15);
    doc.line(margin, y + rowHeight, margin + tableWidth, y + rowHeight);

    xOff = margin;
    row.forEach((cell, i) => {
      const align = colAligns?.[i] || 'left';
      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      doc.setTextColor(...THEME.bodyText);

      let text = String(cell);
      const maxChars = Math.floor(colWidths[i] / 2);
      if (text.length > maxChars) text = text.substring(0, maxChars - 1) + '…';

      const tx = align === 'right' ? xOff + colWidths[i] - cellPadding
        : align === 'center' ? xOff + colWidths[i] / 2
          : xOff + cellPadding;
      doc.text(text, tx, y + rowHeight / 2 + 1, {
        align: align === 'right' ? 'right' : (align === 'center' ? 'center' : 'left'),
        baseline: 'middle'
      });
      xOff += colWidths[i];
    });
    y += rowHeight;
  });

  // Outer border
  doc.setDrawColor(...THEME.primary);
  doc.setLineWidth(0.3);
  doc.rect(margin, startY, tableWidth, y - startY, 'S');

  return y;
}

export default function ExportReports({ data = {} }) {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('analytics');
  const [exporting, setExporting] = useState(false);

  const safeData = {
    views: data?.views || 0,
    clicks: data?.clicks || 0,
    conversionRate: data?.conversionRate || 0,
    bounceRate: data?.bounceRate || 0,
    totalRevenue: data?.totalRevenue || 0,
    campaigns: data?.campaigns || [],
    transactions: data?.transactions || [],
    supporters: data?.supporters || []
  };

  const getPeriodLabel = () => dateRange === 'all' ? 'All Time' : `Last ${dateRange} Days`;

  // ========================================
  //  PDF EXPORT
  // ========================================
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // ── HEADER BAR ──
      doc.setFillColor(...THEME.primary);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFillColor(...THEME.accent);
      doc.rect(0, 40, pageWidth, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...THEME.headerText);
      doc.text('Get Me A Chai', margin, 18);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Analytics Report', margin, 28);

      doc.setFontSize(9);
      doc.text(`Period: ${getPeriodLabel()}`, pageWidth - margin, 18, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - margin, 26, { align: 'right' });

      let yPos = 55;

      // ── SECTION: Key Metrics ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...THEME.primary);
      doc.text('Key Metrics', margin, yPos);
      doc.setDrawColor(...THEME.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 2, margin + 30, yPos + 2);
      yPos += 8;

      yPos = drawTable(doc, {
        startY: yPos,
        margin,
        pageWidth,
        pageHeight,
        head: ['Metric', 'Value'],
        body: [
          ['Total Views', safeData.views.toLocaleString('en-IN')],
          ['Total Clicks', safeData.clicks.toLocaleString('en-IN')],
          ['Conversion Rate', `${safeData.conversionRate.toFixed(2)}%`],
          ['Bounce Rate', `${safeData.bounceRate.toFixed(1)}%`],
          ['Total Revenue', `₹${safeData.totalRevenue.toLocaleString('en-IN')}`],
        ],
        colWidths: [contentWidth * 0.55, contentWidth * 0.45],
        colAligns: ['left', 'right'],
      });
      yPos += 15;

      // ── SECTION: Performance Cards ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...THEME.primary);
      doc.text('Performance Summary', margin, yPos);
      doc.setDrawColor(...THEME.primary);
      doc.line(margin, yPos + 2, margin + 42, yPos + 2);
      yPos += 10;

      const cardWidth = (contentWidth - 10) / 3;
      const cardHeight = 30;
      const cards = [
        { label: 'Views', value: safeData.views.toLocaleString('en-IN'), color: THEME.primary },
        { label: 'Revenue', value: `₹${safeData.totalRevenue.toLocaleString('en-IN')}`, color: THEME.accent },
        { label: 'Conversion', value: `${safeData.conversionRate.toFixed(2)}%`, color: THEME.primaryDark },
      ];

      cards.forEach((card, i) => {
        const x = margin + i * (cardWidth + 5);
        doc.setFillColor(...card.color);
        doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(card.label, x + cardWidth / 2, yPos + 10, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(card.value, x + cardWidth / 2, yPos + 22, { align: 'center' });
      });
      yPos += cardHeight + 15;

      // ── SECTION: Campaign Breakdown ──
      if (safeData.campaigns.length > 0) {
        if (yPos > pageHeight - 80) { doc.addPage(); yPos = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...THEME.primary);
        doc.text('Campaign Breakdown', margin, yPos);
        doc.setDrawColor(...THEME.primary);
        doc.line(margin, yPos + 2, margin + 42, yPos + 2);
        yPos += 8;

        const campaignRows = safeData.campaigns.map((c, i) => [
          `${i + 1}`,
          c.title || 'Untitled',
          (c.views || 0).toLocaleString('en-IN'),
          (c.supporters || 0).toLocaleString('en-IN'),
          `₹${(c.revenue || 0).toLocaleString('en-IN')}`,
        ]);

        yPos = drawTable(doc, {
          startY: yPos,
          margin,
          pageWidth,
          pageHeight,
          head: ['#', 'Campaign Name', 'Views', 'Supporters', 'Revenue'],
          body: campaignRows,
          colWidths: [12, contentWidth - 87, 22, 25, 28],
          colAligns: ['center', 'left', 'right', 'right', 'right'],
        });
        yPos += 12;

        // Top Performer Badge
        if (yPos < pageHeight - 40) {
          const topCampaign = [...safeData.campaigns].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

          doc.setFillColor(...THEME.accentLight);
          doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'F');
          doc.setDrawColor(...THEME.accent);
          doc.setLineWidth(0.5);
          doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...THEME.accent);
          doc.text('★  TOP PERFORMING CAMPAIGN', margin + 6, yPos + 8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...THEME.bodyText);
          doc.text(
            `${topCampaign.title || 'Untitled'}  —  ₹${(topCampaign.revenue || 0).toLocaleString('en-IN')} revenue  •  ${(topCampaign.views || 0).toLocaleString('en-IN')} views`,
            margin + 6, yPos + 17
          );
        }
      }

      // ── FOOTER ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...THEME.border);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...THEME.mutedText);
        doc.text('Get Me A Chai — Confidential Analytics Report', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      doc.save(`GetMeAChai-Analytics-${getPeriodLabel().replace(/\s/g, '')}.pdf`);
      toast.success('PDF report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ========================================
  //  CSV EXPORT
  // ========================================
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const Papa = (await import('papaparse')).default;
      let csvData = [];

      if (reportType === 'analytics') {
        csvData = [
          ['═══════════════════════════════════════════════════════'],
          ['GET ME A CHAI — ANALYTICS REPORT'],
          [`Period: ${getPeriodLabel()}`],
          [`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`],
          ['═══════════════════════════════════════════════════════'],
          [],
          ['── KEY METRICS ──'],
          ['Metric', 'Value'],
          ['Total Views', safeData.views],
          ['Total Clicks', safeData.clicks],
          ['Conversion Rate', `${safeData.conversionRate.toFixed(2)}%`],
          ['Bounce Rate', `${safeData.bounceRate.toFixed(1)}%`],
          ['Total Revenue (INR)', safeData.totalRevenue],
          [],
          ['── CAMPAIGN BREAKDOWN ──'],
          ['#', 'Campaign Name', 'Views', 'Supporters', 'Revenue (INR)'],
          ...safeData.campaigns.map((c, i) => [
            i + 1,
            c.title || 'Untitled',
            c.views || 0,
            c.supporters || 0,
            c.revenue || 0
          ]),
          [],
          ['── SUMMARY ──'],
          ['Total Campaigns', safeData.campaigns.length],
          ['Total Views', safeData.views],
          ['Total Revenue (INR)', safeData.totalRevenue],
          ['Best Campaign', safeData.campaigns.length > 0
            ? [...safeData.campaigns].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.title || 'N/A'
            : 'N/A'
          ],
        ];
      } else if (reportType === 'transactions') {
        csvData = [
          ['GET ME A CHAI — TRANSACTIONS REPORT'],
          [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
          [],
          ['Date', 'Supporter', 'Amount (INR)', 'Campaign', 'Status'],
          ...safeData.transactions.map(t => [
            new Date(t.createdAt).toLocaleDateString('en-IN'),
            t.name,
            t.amount,
            t.campaign?.title || 'General',
            t.status
          ])
        ];
      } else if (reportType === 'supporters') {
        csvData = [
          ['GET ME A CHAI — SUPPORTERS REPORT'],
          [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
          [],
          ['Name', 'Email', 'Total Contributed (INR)', 'Donations Count'],
          ...safeData.supporters.map(s => [
            s.name, s.email, s.totalContributed, s.donationsCount
          ])
        ];
      }

      const csv = Papa.unparse(csvData);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GetMeAChai-${reportType}-${getPeriodLabel().replace(/\s/g, '')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV report exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ========================================
  //  EXCEL EXPORT
  // ========================================
  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      if (reportType === 'analytics') {
        // Sheet 1: Overview
        const overviewData = [
          ['GET ME A CHAI — ANALYTICS REPORT'],
          [`Period: ${getPeriodLabel()}`],
          [`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`],
          [],
          ['KEY METRICS'],
          ['Metric', 'Value', 'Status'],
          ['Total Views', safeData.views, safeData.views > 100 ? '✓ Good' : '↑ Needs Growth'],
          ['Total Clicks', safeData.clicks, safeData.clicks > 50 ? '✓ Good' : '↑ Needs Growth'],
          ['Conversion Rate', `${safeData.conversionRate.toFixed(2)}%`, safeData.conversionRate > 5 ? '✓ Excellent' : '↑ Room to Improve'],
          ['Bounce Rate', `${safeData.bounceRate.toFixed(1)}%`, safeData.bounceRate < 50 ? '✓ Healthy' : '⚠ High'],
          ['Total Revenue', `₹${safeData.totalRevenue.toLocaleString('en-IN')}`, ''],
          [],
          ['PERFORMANCE INDICATORS'],
          ['Indicator', 'Value', 'Benchmark'],
          ['Click-Through Rate', `${(safeData.views > 0 ? (safeData.clicks / safeData.views * 100) : 0).toFixed(1)}%`, '> 20% is good'],
          ['Revenue per View', `₹${(safeData.views > 0 ? (safeData.totalRevenue / safeData.views) : 0).toFixed(2)}`, '> ₹5 is good'],
          ['Avg Revenue per Campaign', `₹${(safeData.campaigns.length > 0 ? (safeData.totalRevenue / safeData.campaigns.length) : 0).toFixed(0)}`, ''],
        ];

        const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
        ws1['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }];
        ws1['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
        ];
        XLSX.utils.book_append_sheet(wb, ws1, 'Overview');

        // Sheet 2: Campaign Details
        const campaignData = [
          ['CAMPAIGN BREAKDOWN'],
          [],
          ['#', 'Campaign Name', 'Views', 'Supporters', 'Revenue (₹)', '% of Total Revenue'],
          ...safeData.campaigns.map((c, i) => [
            i + 1,
            c.title || 'Untitled',
            c.views || 0,
            c.supporters || 0,
            c.revenue || 0,
            safeData.totalRevenue > 0
              ? `${((c.revenue || 0) / safeData.totalRevenue * 100).toFixed(1)}%`
              : '0%'
          ]),
          [],
          ['TOTALS', '',
            safeData.campaigns.reduce((s, c) => s + (c.views || 0), 0),
            safeData.campaigns.reduce((s, c) => s + (c.supporters || 0), 0),
            safeData.totalRevenue,
            '100%'
          ],
        ];

        const ws2 = XLSX.utils.aoa_to_sheet(campaignData);
        ws2['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 18 }];
        ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Campaigns');

        // Sheet 3: Raw Data
        const rawData = [
          ['RAW DATA (For Charts & Analysis)'],
          [],
          ['Campaign', 'Views', 'Supporters', 'Revenue', 'Conversion Rate'],
          ...safeData.campaigns.map(c => [
            c.title || 'Untitled',
            c.views || 0,
            c.supporters || 0,
            c.revenue || 0,
            c.views > 0 ? `${((c.supporters || 0) / c.views * 100).toFixed(2)}%` : '0%'
          ]),
        ];

        const ws3 = XLSX.utils.aoa_to_sheet(rawData);
        ws3['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, ws3, 'Raw Data');

      } else if (reportType === 'transactions') {
        const txData = [
          ['GET ME A CHAI — TRANSACTIONS REPORT'],
          [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
          [],
          ['Date', 'Supporter', 'Amount (₹)', 'Campaign', 'Status'],
          ...safeData.transactions.map(t => [
            new Date(t.createdAt).toLocaleDateString('en-IN'),
            t.name, t.amount, t.campaign?.title || 'General', t.status
          ]),
          [],
          ['Total Transactions', safeData.transactions.length],
          ['Total Amount', safeData.transactions.reduce((s, t) => s + (t.amount || 0), 0)],
        ];
        const ws = XLSX.utils.aoa_to_sheet(txData);
        ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 35 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      } else if (reportType === 'supporters') {
        const supData = [
          ['GET ME A CHAI — SUPPORTERS REPORT'],
          [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
          [],
          ['Name', 'Email', 'Total Contributed (₹)', 'Donations Count'],
          ...safeData.supporters.map(s => [s.name, s.email, s.totalContributed, s.donationsCount]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(supData);
        ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 22 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Supporters');
      }

      XLSX.writeFile(wb, `GetMeAChai-${reportType}-${getPeriodLabel().replace(/\s/g, '')}.xlsx`);
      toast.success('Excel report exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ========================================
  //  RENDER
  // ========================================
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" /> Export Reports
        </h3>
        <p className="text-sm text-gray-400">Download beautifully formatted reports for offline analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="analytics">Analytics Summary</option>
            <option value="transactions">Transactions Detailed</option>
            <option value="supporters">Supporters List</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToPDF}
          disabled={exporting}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center group-hover:from-rose-500/30 group-hover:to-rose-600/20 transition-colors border border-rose-500/20">
            <FileText className="w-7 h-7 text-rose-400 group-hover:text-rose-300 transition-colors" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-gray-200 group-hover:text-rose-300 block">Export PDF</span>
            <span className="text-xs text-gray-500">Tables & charts</span>
          </div>
        </button>

        <button
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToCSV}
          disabled={exporting}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-colors border border-emerald-500/20">
            <FileText className="w-7 h-7 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-gray-200 group-hover:text-emerald-300 block">Export CSV</span>
            <span className="text-xs text-gray-500">Structured data</span>
          </div>
        </button>

        <button
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToExcel}
          disabled={exporting}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-colors border border-blue-500/20">
            <FileSpreadsheet className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-gray-200 group-hover:text-blue-300 block">Export Excel</span>
            <span className="text-xs text-gray-500">Multi-sheet workbook</span>
          </div>
        </button>
      </div>

      {exporting && (
        <div className="mt-6 flex items-center justify-center gap-3 text-purple-400 animate-pulse">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">Generating your report...</span>
        </div>
      )}
    </div>
  );
}
