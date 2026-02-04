'use client';

import Link from 'next/link';
import { FaPlus, FaChartLine, FaUsers, FaEdit, FaChevronRight } from 'react-icons/fa';

export default function QuickActions() {
  const actions = [
    {
      href: '/dashboard/create-campaign',
      icon: FaPlus,
      label: 'Create Campaign',
      description: 'Start fundraising',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      href: '/dashboard/analytics',
      icon: FaChartLine,
      label: 'View Analytics',
      description: 'Check performance',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      href: '/dashboard/supporters',
      icon: FaUsers,
      label: 'Supporters',
      description: 'Manage community',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      href: '/dashboard/content',
      icon: FaEdit,
      label: 'Post Update',
      description: 'Share news',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white px-1">Quick Actions</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative flex flex-col p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${action.bgColor} ${action.color} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <FaChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <h4 className="font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">{action.label}</h4>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
