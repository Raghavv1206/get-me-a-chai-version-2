// components/admin/UserManagement.js
"use client"

/**
 * User Management Component
 * 
 * Features:
 * - List all users
 * - Search and filter
 * - User details
 * - Actions: verify, ban, delete, message
 * - Pagination
 * - Bulk actions
 * 
 * @component
 */

import { useState } from 'react';
import { Search, Filter, UserCheck, UserX, Trash2, Mail, MoreVertical, Shield, AlertTriangle } from 'lucide-react';
import { banUser, verifyUser } from '@/actions/adminActions';

export default function UserManagement({ users, total, page, totalPages, onPageChange, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        verified: 'all',
        banned: 'all',
        isAdmin: 'all',
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Handle user action
    const handleUserAction = async (userId, action, data = {}) => {
        setActionLoading(`${userId}-${action}`);

        try {
            let result;

            switch (action) {
                case 'verify':
                    result = await verifyUser(userId);
                    break;

                case 'ban':
                    result = await banUser(userId, true, data.reason || 'Banned by admin');
                    break;

                case 'unban':
                    result = await banUser(userId, false);
                    break;

                default:
                    console.error('Unknown action:', action);
                    return;
            }

            if (result.success) {
                alert(result.message || 'Action completed successfully');
                if (onRefresh) onRefresh();
            } else {
                alert(result.error || 'Action failed');
            }

        } catch (error) {
            console.error('User action error:', error);
            alert('Failed to perform action');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {total.toLocaleString()} total users
                    </p>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or username..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Verification Status
                            </label>
                            <select
                                value={filters.verified}
                                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="all">All Users</option>
                                <option value="true">Verified Only</option>
                                <option value="false">Unverified Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ban Status
                            </label>
                            <select
                                value={filters.banned}
                                onChange={(e) => setFilters({ ...filters, banned: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="all">All Users</option>
                                <option value="false">Active Only</option>
                                <option value="true">Banned Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Admin Status
                            </label>
                            <select
                                value={filters.isAdmin}
                                onChange={(e) => setFilters({ ...filters, isAdmin: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="all">All Users</option>
                                <option value="true">Admins Only</option>
                                <option value="false">Regular Users</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users && users.length > 0 ? (
                                users.map((user) => (
                                    <UserRow
                                        key={user._id}
                                        user={user}
                                        onAction={handleUserAction}
                                        actionLoading={actionLoading}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * User Row Component
 */
function UserRow({ user, onAction, actionLoading }) {
    const [showActions, setShowActions] = useState(false);

    const isLoading = (action) => actionLoading === `${user._id}-${action}`;

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            {/* User Info */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {user.name || 'Unknown User'}
                            {user.isAdmin && (
                                <Shield className="w-4 h-4 text-purple-600" title="Admin" />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                        </div>
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    {user.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full w-fit">
                            <UserCheck className="w-3 h-3" />
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full w-fit">
                            Unverified
                        </span>
                    )}
                    {user.banned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Banned
                        </span>
                    )}
                </div>
            </td>

            {/* Stats */}
            <td className="px-6 py-4">
                <div className="text-sm space-y-1">
                    <div className="text-gray-900 dark:text-white">
                        {user.stats?.campaignsCount || 0} campaigns
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                        ₹{(user.stats?.totalContributed || 0).toLocaleString()} contributed
                    </div>
                </div>
            </td>

            {/* Joined Date */}
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {new Date(user.createdAt).toLocaleDateString()}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <div className="relative inline-block">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                            <div className="py-2">
                                {!user.verified && (
                                    <button
                                        onClick={() => {
                                            onAction(user._id, 'verify');
                                            setShowActions(false);
                                        }}
                                        disabled={isLoading('verify')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        {isLoading('verify') ? 'Verifying...' : 'Verify User'}
                                    </button>
                                )}

                                {!user.isAdmin && (
                                    <>
                                        {user.banned ? (
                                            <button
                                                onClick={() => {
                                                    onAction(user._id, 'unban');
                                                    setShowActions(false);
                                                }}
                                                disabled={isLoading('unban')}
                                                className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                {isLoading('unban') ? 'Unbanning...' : 'Unban User'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Enter ban reason:');
                                                    if (reason) {
                                                        onAction(user._id, 'ban', { reason });
                                                    }
                                                    setShowActions(false);
                                                }}
                                                disabled={isLoading('ban')}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <UserX className="w-4 h-4" />
                                                {isLoading('ban') ? 'Banning...' : 'Ban User'}
                                            </button>
                                        )}
                                    </>
                                )}

                                <button
                                    onClick={() => {
                                        window.location.href = `mailto:${user.email}`;
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
