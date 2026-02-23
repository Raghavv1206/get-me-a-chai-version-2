'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndianRupee } from 'lucide-react';

export default function RevenueChart({ data = {} }) {
    const campaigns = (data && data.campaigns) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl z-50">
                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-white font-medium text-sm">
                                {entry.name}:
                            </span>
                            <span className="text-gray-200 text-sm font-bold">
                                ₹{entry.value.toLocaleString('en-IN')}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Show message if no data
    if (campaigns.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-xl font-bold text-white mb-2">Revenue Analytics</h3>
                <p className="text-gray-500">No revenue data available yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-400" /> Revenue by Campaign
            </h3>
            <p className="text-sm text-gray-400 mb-6">Compare performance across your campaigns</p>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaigns} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar
                            dataKey="thisMonth"
                            name="This Month"
                            fill="#8b5cf6"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                        />
                        <Bar
                            dataKey="lastMonth"
                            name="Last Month"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
