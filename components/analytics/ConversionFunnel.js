'use client';

import { TrendingDown } from 'lucide-react';

export default function ConversionFunnel({ data = {} }) {
  const steps = data.steps || [
    { name: 'Views', value: (data && data.views) || 0, color: 'bg-blue-500' },
    { name: 'Clicks', value: (data && data.clicks) || 0, color: 'bg-emerald-500' },
    { name: 'Donations', value: (data && data.donations) || 0, color: 'bg-amber-500' }
  ];

  const maxValue = Math.max(...steps.map(s => s.value), 1); // Ensure at least 1

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 h-full">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-purple-400" /> Conversion Funnel
        </h3>
        <p className="text-sm text-gray-400">Visitor journey from view to donation</p>
      </div>

      <div className="space-y-6 relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/5 -z-10 hidden sm:block"></div>

        {steps.map((step, index) => {
          const width = Math.max((step.value / maxValue) * 100, 5); // Min 5% width
          const prevValue = index > 0 ? steps[index - 1].value : 0;
          const dropOff = index > 0 && prevValue > 0
            ? ((prevValue - step.value) / prevValue * 100).toFixed(1)
            : '0.0';
          const conversionRate = index > 0 && steps[0].value > 0
            ? ((step.value / steps[0].value) * 100).toFixed(1)
            : null;

          return (
            <div key={step.name} className="relative">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Step Circle */}
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-black/40 border border-white/10 items-center justify-center shrink-0 z-10">
                  <span className="text-gray-400 font-bold text-lg">{index + 1}</span>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-300 font-medium">{step.name}</span>
                    <div className="text-right">
                      <span className="text-white font-bold text-lg block">{step.value.toLocaleString()}</span>
                      {conversionRate && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {conversionRate}% of total
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${step.color} shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.5)] transition-all duration-1000 ease-out relative group`}
                      style={{ width: `${width}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                    </div>
                  </div>

                  {index > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-rose-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      <span>{dropOff}% drop-off from previous step</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Overall Conversion</p>
          <p className="text-2xl font-bold text-white">
            {steps[0].value > 0
              ? ((steps[steps.length - 1].value / steps[0].value) * 100).toFixed(2)
              : '0.00'}%
          </p>
        </div>
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Conversions</p>
          <p className="text-2xl font-bold text-emerald-400">
            {steps[steps.length - 1].value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
