'use client';

import { useState } from 'react';
import { FaSearch, FaSort, FaDownload } from 'react-icons/fa';
import Papa from 'papaparse';

export default function SupportersTable({ supporters: initialSupporters }) {
  const [supporters, setSupporters] = useState(initialSupporters || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalContributed'); // name, email, totalContributed, lastDonation, donationsCount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredSupporters = supporters.filter(supporter =>
    supporter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supporter.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSupporters = [...filteredSupporters].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'lastDonation') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const paginatedSupporters = sortedSupporters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedSupporters.length / itemsPerPage);

  const exportToCSV = () => {
    const csvData = [
      ['Name', 'Email', 'Total Contributed', 'Last Donation', 'Donations Count'],
      ...sortedSupporters.map(s => [
        s.name,
        s.email,
        s.totalContributed,
        new Date(s.lastDonation).toLocaleDateString(),
        s.donationsCount
      ])
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supporters.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="supporters-table">
      <div className="table-header">
        <div className="search-box">
          <FaSearch className="search-icon top-10 left-10" />
          <input
            type="text"
            placeholder="Search supporters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="export-btn" onClick={exportToCSV}>
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name <FaSort />
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email <FaSort />
              </th>
              <th onClick={() => handleSort('totalContributed')} className="sortable">
                Total Contributed <FaSort />
              </th>
              <th onClick={() => handleSort('lastDonation')} className="sortable">
                Last Donation <FaSort />
              </th>
              <th onClick={() => handleSort('donationsCount')} className="sortable">
                # of Donations <FaSort />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSupporters.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-icon">👥</div>
                  <p>No supporters found</p>
                </td>
              </tr>
            ) : (
              paginatedSupporters.map((supporter) => (
                <tr key={supporter._id}>
                  <td>
                    <div className="supporter-cell">
                      <div className="supporter-avatar">
                        {supporter.name?.charAt(0) || 'U'}
                      </div>
                      <span className="supporter-name">{supporter.name}</span>
                    </div>
                  </td>
                  <td className="email-cell">{supporter.email}</td>
                  <td className="amount-cell">
                    ₹{supporter.totalContributed.toLocaleString('en-IN')}
                  </td>
                  <td className="date-cell">
                    {new Date(supporter.lastDonation).toLocaleDateString()}
                  </td>
                  <td className="count-cell">{supporter.donationsCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .supporters-table {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 1;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border: 2px solid #334155;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: #0f172a;
          color: #f1f5f9;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .table-container {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table thead {
          background: #0f172a;
        }

        .table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
        }

        .table th.sortable:hover {
          background: #1e293b;
          color: #e2e8f0;
        }

        .table td {
          padding: 16px;
          border-top: 1px solid #334155;
        }

        .table tbody tr:hover {
          background: #0f172a;
        }

        .supporter-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .supporter-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .supporter-name {
          font-weight: 600;
          color: #f1f5f9;
        }

        .email-cell {
          color: #94a3b8;
        }

        .amount-cell {
          font-weight: 700;
          color: #10b981;
        }

        .date-cell {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .count-cell {
          font-weight: 600;
          color: #e2e8f0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }

        .empty-state p {
          color: #94a3b8;
          margin: 0;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #334155;
        }

        .page-btn {
          padding: 8px 16px;
          background: #0f172a;
          border: 2px solid #334155;
          border-radius: 10px;
          font-weight: 600;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .export-btn {
            width: 100%;
            justify-content: center;
          }

          .table {
            font-size: 0.85rem;
          }

          .table th,
          .table td {
            padding: 10px 8px;
          }

          .supporter-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
