// components/UserProfileDropdown.js - Enhanced User Dropdown
"use client"
import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';

export default function UserProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { 
      icon: '📊', 
      label: 'Dashboard', 
      href: '/dashboard',
      show: user?.role === 'creator' || user?.role === 'admin'
    },
    { 
      icon: '👤', 
      label: 'My Page', 
      href: `/${user?.name}`,
      show: user?.role === 'creator'
    },
    { 
      icon: '🚀', 
      label: 'My Campaigns', 
      href: '/dashboard/campaigns',
      show: user?.role === 'creator'
    },
    { 
      icon: '💰', 
      label: 'Contributions', 
      href: '/my-contributions',
      show: true
    },
    { 
      icon: '⚙️', 
      label: 'Settings', 
      href: '/dashboard/settings',
      show: true
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      icon: '🛡️',
      label: 'Admin Panel',
      href: '/admin',
      show: true,
      highlight: true
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all"
      >
        <UserAvatar user={user} size="sm" showVerified />
        <span className="hidden md:block text-white text-sm font-medium max-w-[120px] truncate">
          {user?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 backdrop-blur-md bg-gray-900/95 border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-slide-down z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <UserAvatar user={user} size="md" showVerified />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{user?.name}</p>
                <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              </div>
            </div>
            {user?.role && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                <span className="text-xs text-purple-400 font-medium capitalize">{user.role}</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => 
              item.show && (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    item.highlight ? 'bg-purple-500/10' : ''
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className={item.highlight ? 'text-purple-400 font-semibold' : ''}>
                      {item.label}
                    </span>
                  </span>
                </Link>
              )
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-800 py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🚪</span>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}