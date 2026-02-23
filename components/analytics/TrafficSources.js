'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

export default function TrafficSources({ data = [] }) {
  const COLORS = {
    direct: '#8b5cf6', // purple
    social: '#10b981', // emerald
    search: '#f59e0b', // amber
    referral: '#3b82f6', // blue
    other: '#6b7280'   // gray
  };

  // Ensure data is an array
  const trafficData = Array.isArray(data) ? data : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">
              {payload[0].value.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm">
              ({payload[0].payload.percentage}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show message if no data
  if (trafficData.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-xl font-bold text-white mb-2">Traffic Sources</h3>
        <p className="text-gray-500">No traffic data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span><Globe className="w-5 h-5 text-purple-400" /></span> Traffic Sources
      </h3>

      <div className="h-[250px] w-full mb-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={trafficData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {trafficData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.source] || COLORS.other}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Summary */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-2xl font-bold text-white">
            {trafficData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Visits</div>
        </div>
      </div>

      <div className="space-y-3">
        {trafficData.map((source) => (
          <div key={source.source} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-sm shadow-black/50"
                style={{ backgroundColor: COLORS[source.source] || COLORS.other }}
              ></div>
              <span className="text-gray-300 font-medium capitalize group-hover:text-white transition-colors">{source.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{source.value.toLocaleString()}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-black/20 text-gray-400 border border-white/5">
                {source.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
