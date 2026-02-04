'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaHome,
  FaFolder,
  FaChartLine,
  FaUsers,
  FaEdit,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';

export default function DashboardSidebar({ user }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FaHome, label: 'Overview' },
    { href: '/dashboard/campaigns', icon: FaFolder, label: 'Campaigns' },
    { href: '/dashboard/analytics', icon: FaChartLine, label: 'Analytics' },
    { href: '/dashboard/supporters', icon: FaUsers, label: 'Supporters' },
    { href: '/dashboard/content', icon: FaEdit, label: 'Content' },
    { href: '/dashboard/settings', icon: FaCog, label: 'Settings' }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed to Top Left */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-xl shadow-lg border border-white/10"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-black border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-8 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-xl">☕</span>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:text-white transition-colors">
                GetMeAChai
              </span>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <Image
                  src={user?.profilepic || '/images/default-profilepic.jpg'}
                  alt={user?.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
