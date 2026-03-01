// components/supporters/SupportersPageClient.js
// Client wrapper that connects filters to the supporters table
'use client';

import { useState, useMemo, useCallback } from 'react';
import SupporterFilters from './SupporterFilters';
import SupportersTable from './SupportersTable';

/**
 * Parses a date range filter value into a start date
 * @param {string} range - Filter value: 'all', 'today', 'week', 'month', 'quarter', 'year'
 * @returns {Date|null} - The start date for filtering, or null for 'all'
 */
function getDateRangeStart(range) {
    if (range === 'all') return null;

    const now = new Date();
    const start = new Date(now);

    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setDate(now.getDate() - 30);
            break;
        case 'quarter':
            start.setDate(now.getDate() - 90);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return null;
    }

    return start;
}

export default function SupportersPageClient({ payments, campaigns }) {
    const [activeFilters, setActiveFilters] = useState({
        dateRange: 'all',
        minAmount: '',
        maxAmount: '',
        campaign: 'all',
        frequency: 'all'
    });

    // Build campaign options for the filter dropdown from real campaign data
    const campaignOptions = useMemo(() => {
        return campaigns.map(c => ({
            value: c._id,
            label: c.title
        }));
    }, [campaigns]);

    // Apply filters to raw payments, then aggregate into supporters
    const filteredSupporters = useMemo(() => {
        // Step 1: Filter payments based on active filters
        let filtered = payments;

        // Date Range filter
        const dateStart = getDateRangeStart(activeFilters.dateRange);
        if (dateStart) {
            filtered = filtered.filter(p => new Date(p.createdAt) >= dateStart);
        }

        // Campaign filter
        if (activeFilters.campaign !== 'all') {
            filtered = filtered.filter(p => {
                const paymentCampaignId = typeof p.campaign === 'object' ? p.campaign?._id : p.campaign;
                return paymentCampaignId === activeFilters.campaign;
            });
        }

        // Frequency/type filter
        if (activeFilters.frequency !== 'all') {
            const typeValue = activeFilters.frequency === 'recurring' ? 'subscription' : 'one-time';
            filtered = filtered.filter(p => (p.type || 'one-time') === typeValue);
        }

        // Step 2: Aggregate filtered payments into supporters
        const supportersMap = {};

        filtered.forEach(payment => {
            const supporterId = payment.email || 'anonymous';

            if (!supportersMap[supporterId]) {
                supportersMap[supporterId] = {
                    _id: payment._id,
                    name: payment.name || 'Anonymous',
                    email: payment.email || 'No Email',
                    totalContributed: 0,
                    donationsCount: 0,
                    lastDonation: new Date(0).toISOString(),
                    campaignsSupported: new Set()
                };
            }

            const supporter = supportersMap[supporterId];
            supporter.totalContributed += payment.amount;
            supporter.donationsCount += 1;

            if (payment.campaign) {
                const cId = typeof payment.campaign === 'object' ? payment.campaign?._id : payment.campaign;
                if (cId) supporter.campaignsSupported.add(cId);
            }

            const paymentDate = new Date(payment.createdAt);
            if (paymentDate > new Date(supporter.lastDonation)) {
                supporter.lastDonation = paymentDate.toISOString();
            }
        });

        // Step 3: Convert to array and apply amount filters
        let supporters = Object.values(supportersMap).map(s => ({
            ...s,
            campaignsSupported: s.campaignsSupported.size
        }));

        // Amount range filter (applied after aggregation on total contributed)
        const minAmount = activeFilters.minAmount !== '' ? parseFloat(activeFilters.minAmount) : null;
        const maxAmount = activeFilters.maxAmount !== '' ? parseFloat(activeFilters.maxAmount) : null;

        if (minAmount !== null && !isNaN(minAmount)) {
            supporters = supporters.filter(s => s.totalContributed >= minAmount);
        }
        if (maxAmount !== null && !isNaN(maxAmount)) {
            supporters = supporters.filter(s => s.totalContributed <= maxAmount);
        }

        // Sort by total contributed (descending)
        supporters.sort((a, b) => b.totalContributed - a.totalContributed);

        return supporters;
    }, [payments, activeFilters]);

    // Handle filter changes from SupporterFilters component
    const handleFilterChange = useCallback((newFilters) => {
        setActiveFilters(newFilters);
    }, []);

    return (
        <>
            <SupporterFilters
                onFilterChange={handleFilterChange}
                campaigns={campaignOptions}
                activeFilters={activeFilters}
            />
            <SupportersTable supporters={filteredSupporters} />
        </>
    );
}
