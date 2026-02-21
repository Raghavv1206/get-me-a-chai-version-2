'use client';

import { useState } from 'react';
import { FaFilePdf, FaFileCsv, FaFileExcel, FaDownload, FaCalendar } from 'react-icons/fa';
import { toast } from '@/lib/apiToast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ExportReports({ data }) {
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, all
  const [reportType, setReportType] = useState('analytics'); // analytics, transactions, supporters
  const [exporting, setExporting] = useState(false);

  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('Get Me A Chai - Analytics Report', 20, 20);

      // Date range
      doc.setFontSize(12);
      doc.text(`Period: Last ${dateRange} days`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

      // Add data based on report type
      let yPos = 60;
      doc.setFontSize(14);
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 20, yPos);

      yPos += 15;
      doc.setFontSize(10);

      if (reportType === 'analytics') {
        doc.text(`Total Views: ${data.views || 0}`, 20, yPos);
        yPos += 10;
        doc.text(`Total Clicks: ${data.clicks || 0}`, 20, yPos);
        yPos += 10;
        doc.text(`Conversion Rate: ${data.conversionRate || 0}%`, 20, yPos);
      }

      doc.save(`report-${reportType}-${dateRange}days.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      let csvData = [];

      if (reportType === 'analytics') {
        csvData = [
          ['Metric', 'Value'],
          ['Total Views', data.views || 0],
          ['Total Clicks', data.clicks || 0],
          ['Conversion Rate', `${data.conversionRate || 0}%`],
          ['Bounce Rate', `${data.bounceRate || 0}%`]
        ];
      } else if (reportType === 'transactions') {
        csvData = [
          ['Date', 'Supporter', 'Amount', 'Campaign', 'Status'],
          ...(data.transactions || []).map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.name,
            t.amount,
            t.campaign?.title,
            t.status
          ])
        ];
      } else if (reportType === 'supporters') {
        csvData = [
          ['Name', 'Email', 'Total Contributed', 'Donations Count'],
          ...(data.supporters || []).map(s => [
            s.name,
            s.email,
            s.totalContributed,
            s.donationsCount
          ])
        ];
      }

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${dateRange}days.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      let wsData = [];

      if (reportType === 'analytics') {
        wsData = [
          ['Get Me A Chai - Analytics Report'],
          [`Period: Last ${dateRange} days`],
          [`Generated: ${new Date().toLocaleDateString()}`],
          [],
          ['Metric', 'Value'],
          ['Total Views', data.views || 0],
          ['Total Clicks', data.clicks || 0],
          ['Conversion Rate', `${data.conversionRate || 0}%`],
          ['Bounce Rate', `${data.bounceRate || 0}%`]
        ];
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `report-${reportType}-${dateRange}days.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span>📥</span> Export Reports
        </h3>
        <p className="text-sm text-gray-400">Download your data in various formats for offline analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Date Range Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FaCalendar className="text-purple-400" /> Date Range
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

        {/* Report Type Selector */}
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
          <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <FaFilePdf className="text-2xl text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <span className="font-medium text-gray-300 group-hover:text-rose-400">Export PDF</span>
        </button>

        <button
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToCSV}
          disabled={exporting}
        >
          <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <FaFileCsv className="text-2xl text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <span className="font-medium text-gray-300 group-hover:text-emerald-400">Export CSV</span>
        </button>

        <button
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToExcel}
          disabled={exporting}
        >
          <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <FaFileExcel className="text-2xl text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="font-medium text-gray-300 group-hover:text-blue-400">Export Excel</span>
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
