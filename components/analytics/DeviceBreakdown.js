'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DeviceBreakdown({ data = [] }) {
  const COLORS = {
    mobile: '#667eea', // indigo
    desktop: '#10b981', // emerald
    tablet: '#f59e0b'  // amber
  };

  // Ensure data is an array
  const deviceData = Array.isArray(data) ? data : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{payload[0].payload.name}</p>
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

  const total = deviceData.reduce((sum, item) => sum + item.value, 0);

  // Show message if no data
  if (deviceData.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-xl font-bold text-white mb-2">Device Breakdown</h3>
        <p className="text-gray-500">No device data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📱</span> Device Breakdown
        </h3>
        <span className="bg-white/5 text-gray-400 text-xs font-medium px-2 py-1 rounded-lg border border-white/5">
          Total: {total.toLocaleString()}
        </span>
      </div>

      <div className="h-[250px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deviceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
            <XAxis
              dataKey="name"
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
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.device] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {deviceData.map((device) => (
          <div key={device.device} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-sm shadow-black/50"
                style={{ backgroundColor: COLORS[device.device] }}
              ></div>
              <span className="text-gray-300 font-medium capitalize group-hover:text-white transition-colors">{device.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{device.value.toLocaleString()}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-black/20 text-gray-400 border border-white/5">
                {device.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
