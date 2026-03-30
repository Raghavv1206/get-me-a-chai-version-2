// components/Navbar.js
"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';
import { useScrollIsolation } from '../hooks/useScrollIsolation';
import { Search, Lightbulb, Star, X, Menu, LogIn, Zap, ChevronRight, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mobileMenuScrollRef = useScrollIsolation();
  const mobileMenuRef = useRef(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showMobileMenu]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!showMobileMenu) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowMobileMenu(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMobileMenu]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeMobileMenu = useCallback(() => setShowMobileMenu(false), []);

  const navLinks = [
    { name: 'Explore', href: '/explore', icon: Search, description: 'Discover campaigns' },
    { name: 'How It Works', href: '/about', icon: Lightbulb, description: 'Learn the process' },
    { name: 'Success Stories', href: '/stories', icon: Star, description: 'Get inspired' }
  ];

  const dashboardLinks = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Campaigns', href: '/dashboard/campaigns' },
    { name: 'Analytics', href: '/dashboard/analytics' },
    { name: 'Supporters', href: '/dashboard/supporters' },
    { name: 'Content', href: '/dashboard/content' },
    { name: 'Settings', href: '/dashboard/settings' }
  ];

  const isDashboardPage = pathname?.startsWith('/dashboard');

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw] overflow-x-clip transition-all duration-300 group bg-transparent hover:bg-black/80 hover:backdrop-blur-xl hover:border-b hover:border-white/5 ${scrolled ? 'py-2' : 'py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group/logo relative z-50 flex-shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20 group-hover/logo:shadow-purple-500/40 transition-all duration-300 group-hover/logo:scale-105 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="hidden md:inline text-lg font-bold tracking-tight text-white group-hover/logo:text-gray-200 transition-colors">
                GetMeAChai
              </span>
            </Link>

            {/* Desktop Navigation — centered pill */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                {isDashboardPage ? (
                  dashboardLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${isActive(link.href)
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))
                ) : (
                  navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${isActive(link.href)
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Search button — visible on all sizes */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all flex-shrink-0"
                aria-label="Search (Ctrl+K)"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden lg:inline text-xs text-gray-500 group-hover:text-gray-400">⌘K</span>
              </button>

              {session ? (
                <>
                  <NotificationBell />
                  <UserProfileDropdown user={session.user} />
                </>
              ) : (
                <>
                  {/* Desktop: Login/Signup buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-2">
                      Log in
                    </Link>
                    <Link
                      href="/login"
                      className="px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-lg shadow-white/10"
                    >
                      Start for free
                    </Link>
                  </div>

                  {/* Mobile: Compact login — icon-only on tiny screens, pill on wider */}
                  <Link
                    href="/login"
                    className="md:hidden flex items-center gap-1 px-2 py-1.5 min-[360px]:px-3 text-xs min-[360px]:text-sm font-semibold bg-white text-black rounded-full hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-white/10 flex-shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden min-[360px]:inline">Log in</span>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all active:scale-95 flex-shrink-0"
                aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
                aria-expanded={showMobileMenu}
                type="button"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE MENU — Full-screen slide-up panel
          Clean, modern, app-like feel with smooth transitions.
         ═══════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-x-0 bottom-0 top-0 z-50 md:hidden transition-transform duration-300 ease-out ${showMobileMenu ? 'translate-y-0' : 'translate-y-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="absolute inset-0 bg-gray-950/98 backdrop-blur-2xl" />

        <div ref={mobileMenuScrollRef} className="relative flex flex-col h-full overflow-y-auto overscroll-contain">

          {/* ── Header ── */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">GetMeAChai</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
              aria-label="Close menu"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Search Bar (mobile) ── */}
          <div className="px-5 pt-5 pb-2">
            <button
              onClick={() => {
                closeMobileMenu();
                setTimeout(() => setShowSearchModal(true), 100);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all active:scale-[0.98]"
              type="button"
            >
              <Search className="w-4.5 h-4.5" />
              <span className="text-sm">Search creators, campaigns...</span>
            </button>
          </div>

          {/* ── Navigation Links ── */}
          <div className="px-5 pt-3 pb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-3">
              {isDashboardPage ? 'Dashboard' : 'Navigate'}
            </p>
            <div className="space-y-1">
              {isDashboardPage ? (
                dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${isActive(link.href)
                      ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-white border border-purple-500/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="font-medium">{link.name}</span>
                    {isActive(link.href) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </Link>
                ))
              ) : (
                navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${isActive(link.href)
                        ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-white border border-purple-500/20'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      onClick={closeMobileMenu}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isActive(link.href)
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-white/5 text-gray-400'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive(link.href) ? 'text-purple-400' : 'text-gray-600'}`} />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Quick Actions (only when logged in) ── */}
          {session && (
            <div className="px-5 pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-3">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/start-campaign"
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 hover:text-white transition-all active:scale-[0.97]"
                  onClick={closeMobileMenu}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-xs font-medium">New Campaign</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-[0.97]"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                  </svg>
                  <span className="text-xs font-medium">Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* ── Spacer pushes footer to bottom ── */}
          <div className="flex-1" />

          {/* ── Footer / Auth Section ── */}
          <div className="sticky bottom-0 px-5 py-5 border-t border-white/5 bg-gray-950/95 backdrop-blur-md">
            {session ? (
              <div className="flex items-center gap-3">
                <img
                  src={session.user.profilepic || session.user.image || "/images/default-profilepic.svg"}
                  alt={session.user.name || 'User'}
                  className="w-11 h-11 rounded-full border-2 border-white/10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  onClick={closeMobileMenu}
                  aria-label="Settings"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20"
                  onClick={closeMobileMenu}
                >
                  <Zap className="w-4 h-4" />
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="w-4 h-4" />
                  Log in with existing account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
}
