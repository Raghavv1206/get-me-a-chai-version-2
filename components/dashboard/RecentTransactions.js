'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CreditCard, EyeOff, MessageCircle } from 'lucide-react';

export default function RecentTransactions({ transactions: initialTransactions }) {
  const [transactions] = useState(initialTransactions || []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-white/5 text-gray-400 border border-white/5';
    }
  };

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        <Link
          href="/dashboard/transactions"
          className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Supporter</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center mb-3"><CreditCard className="w-10 h-10 text-gray-500" /></div>
                  <p>No transactions yet</p>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => (
                <tr key={transaction._id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {transaction.anonymous ? <EyeOff className="w-4 h-4 text-white" /> : transaction.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {transaction.anonymous ? 'Anonymous' : transaction.name}
                        </span>
                        <span className="text-xs text-gray-500 hidden sm:block">
                          {transaction.message ? <><MessageCircle className="w-3 h-3 inline-block mr-1" /> Message</> : 'No message'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300 truncate max-w-[150px] inline-block" title={transaction.campaign?.title}>
                      {transaction.campaign?.title || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-green-400">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/20">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="text-white font-medium">{currentPage}</span> of {totalPages}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
