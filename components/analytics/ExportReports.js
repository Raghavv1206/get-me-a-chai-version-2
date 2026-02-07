'use client';

import { useState } from 'react';
import { FaFilePdf, FaFileCsv, FaFileExcel, FaDownload, FaCalendar } from 'react-icons/fa';
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
      alert('Failed to export PDF');
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
      alert('Failed to export CSV');
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
      alert('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-reports">
      <h3 className="export-title">Export Reports</h3>
      <p className="export-subtitle">Download your data in various formats</p>

      <div className="export-options">
        {/* Date Range Selector */}
        <div className="option-group">
          <label className="option-label">
            <FaCalendar /> Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="option-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Report Type Selector */}
        <div className="option-group">
          <label className="option-label">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="option-select"
          >
            <option value="analytics">Analytics</option>
            <option value="transactions">Transactions</option>
            <option value="supporters">Supporters</option>
          </select>
        </div>
      </div>

      <div className="export-buttons">
        <button
          className="export-btn pdf-btn"
          onClick={exportToPDF}
          disabled={exporting}
        >
          <FaFilePdf />
          <span>Export as PDF</span>
        </button>

        <button
          className="export-btn csv-btn"
          onClick={exportToCSV}
          disabled={exporting}
        >
          <FaFileCsv />
          <span>Export as CSV</span>
        </button>

        <button
          className="export-btn excel-btn"
          onClick={exportToExcel}
          disabled={exporting}
        >
          <FaFileExcel />
          <span>Export as Excel</span>
        </button>
      </div>

      {exporting && (
        <div className="exporting-indicator">
          <div className="spinner"></div>
          <span>Generating report...</span>
        </div>
      )}

      <style jsx>{`
        .export-reports {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .export-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px 0;
        }

        .export-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0 0 24px 0;
        }

        .export-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .option-select {
          padding: 10px 14px;
          border: 2px solid #334155;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #f1f5f9;
          background: #0f172a;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-select:hover {
          border-color: #475569;
        }

        .option-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .export-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border: 2px solid;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pdf-btn {
          background: #0f172a;
          color: #ef4444;
          border-color: #ef4444;
        }

        .pdf-btn:hover:not(:disabled) {
          background: #1e293b;
          transform: translateY(-2px);
        }

        .csv-btn {
          background: #0f172a;
          color: #10b981;
          border-color: #10b981;
        }

        .csv-btn:hover:not(:disabled) {
          background: #1e293b;
          transform: translateY(-2px);
        }

        .excel-btn {
          background: #0f172a;
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .excel-btn:hover:not(:disabled) {
          background: #1e293b;
          transform: translateY(-2px);
        }

        .exporting-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
          padding: 16px;
          background: #0f172a;
          border-radius: 12px;
          color: #94a3b8;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #334155;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .export-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
