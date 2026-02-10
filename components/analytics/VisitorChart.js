'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VisitorChart({ data = [] }) {
    const [viewType, setViewType] = useState('all'); // all, unique, returning

    // Ensure data is an array
    const visitorData = Array.isArray(data) ? data : [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
                    <p className="text-gray-400 text-sm mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.stroke }}
                            />
                            <span className="text-white font-medium text-sm">
                                {entry.name}:
                            </span>
                            <span className="text-gray-200 text-sm font-bold">
                                {entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getChartData = () => {
        if (viewType === 'unique') {
            return visitorData.map(d => ({ ...d, returning: 0 }));
        }
        if (viewType === 'returning') {
            return visitorData.map(d => ({ ...d, unique: 0 }));
        }
        return visitorData;
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Visitor Analytics</h3>
                    <p className="text-sm text-gray-400">Track unique and returning visitors over time</p>
                </div>

                <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                    {[
                        { id: 'all', label: 'All Visitors' },
                        { id: 'unique', label: 'Unique' },
                        { id: 'returning', label: 'Returning' }
                    ].map((type) => (
                        <button
                            key={type.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewType === type.id
                                    ? 'bg-white/10 text-white shadow-sm border border-white/5'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            onClick={() => setViewType(type.id)}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 1 }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        {(viewType === 'all' || viewType === 'unique') && (
                            <Area
                                type="monotone"
                                dataKey="unique"
                                name="Unique Visitors"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUnique)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        )}
                        {(viewType === 'all' || viewType === 'returning') && (
                            <Area
                                type="monotone"
                                dataKey="returning"
                                name="Returning Visitors"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorReturning)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
