// components/UserProfileDropdown.js - Modern Premium User Dropdown
"use client"
import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Rocket,
  Heart,
  Settings,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';

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
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      show: user?.role === 'creator' || user?.role === 'admin',
      description: 'View your overview'
    },
    {
      icon: Rocket,
      label: 'My Campaigns',
      href: '/dashboard/campaigns',
      show: user?.role === 'creator',
      description: 'Manage campaigns'
    },
    {
      icon: Heart,
      label: 'Contributions',
      href: '/my-contributions',
      show: true,
      description: 'Your support history'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/settings',
      show: true,
      description: 'Account preferences'
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      icon: Shield,
      label: 'Admin Panel',
      href: '/admin',
      show: true,
      highlight: true,
      description: 'Manage platform'
    });
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all duration-200"
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all">
          <Image
            src={user?.profilepic || '/images/default-profilepic.svg'}
            alt={user?.name || 'User'}
            fill
            className="object-cover"
          />
          {user?.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Name */}
        <span className="hidden md:block text-white text-sm font-medium max-w-[100px] truncate">
          {user?.name}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop blur effect */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-3 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                    <Image
                      src={user?.profilepic || '/images/default-profilepic.svg'}
                      alt={user?.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">{user?.name}</p>
                      {user?.verified && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                  </div>
                </div>
                {user?.role && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-xs text-purple-300 font-medium capitalize">{user.role}</span>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return item.show && (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.highlight
                        ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30'
                        : 'hover:bg-white/5'
                        }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${item.highlight
                        ? 'text-purple-400'
                        : 'text-gray-400 group-hover:text-white'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.highlight ? 'text-purple-300' : 'text-gray-200 group-hover:text-white'
                          }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Sign Out</p>
                    <p className="text-xs text-gray-500 group-hover:text-red-400/60 transition-colors">
                      See you soon!
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}