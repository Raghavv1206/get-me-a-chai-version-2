'use client';

import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaTrophy, FaComment, FaUserPlus, FaEdit, FaCheckCircle, FaStar } from 'react-icons/fa';
import { FileText } from 'lucide-react';

export default function RecentActivity({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_supporter':
        return { Icon: FaUserPlus, color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' };
      case 'milestone_reached':
        return { Icon: FaTrophy, color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' };
      case 'new_comment':
        return { Icon: FaComment, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' };
      case 'campaign_update':
        return { Icon: FaEdit, color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' };
      case 'goal_reached':
        return { Icon: FaCheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' };
      default:
        return { Icon: FaStar, color: 'text-pink-400', bgColor: 'bg-pink-500/10 border-pink-500/20' };
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
      </div>

      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {activities.map((activity, index) => {
              const { Icon, color, bgColor } = getActivityIcon(activity.type);

              return (
                <div key={activity._id || index} className="relative flex items-center gap-4 group">
                  <div className={`absolute left-0 w-10 h-10 rounded-full border ${bgColor} flex items-center justify-center z-10 transition-transform group-hover:scale-110 duration-200 bg-black`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>

                  <div className="pl-12 w-full">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{activity.type?.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200">{activity.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
