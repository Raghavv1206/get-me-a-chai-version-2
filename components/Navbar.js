// components/Navbar.js
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';
import { useScrollIsolation } from '../hooks/useScrollIsolation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mobileMenuScrollRef = useScrollIsolation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

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

  const navLinks = [
    { name: 'Explore', href: '/explore', icon: '🔍' },
    { name: 'How It Works', href: '/about', icon: '💡' },
    { name: 'Success Stories', href: '/stories', icon: '⭐' }
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
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 group bg-transparent hover:bg-black/80 hover:backdrop-blur-xl hover:border-b hover:border-white/5 ${scrolled ? 'py-2' : 'py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-50">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
                GetMeAChai
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                {isDashboardPage ? (
                  // Dashboard Navigation
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
                  // Regular Navigation
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
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group"
                  title="Search (Ctrl+K)"
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
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-2">
                      Log in
                    </Link>
                    <Link href="/login">
                      <button className="px-4 py-1.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-lg shadow-white/10">
                        Start for free
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="sr-only">Open menu</span>
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${showMobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-gray-950 border-l border-white/10 shadow-2xl transform transition-transform duration-300 md:hidden ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div ref={mobileMenuScrollRef} className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <span className="font-bold text-lg text-white">Menu</span>
            <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-2">
            {isDashboardPage ? (
              // Dashboard Links for Mobile
              dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))
            ) : (
              // Regular Links for Mobile
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))
            )}
          </div>

          <div className="mt-auto p-6 border-t border-white/10 bg-black/20">
            {!session ? (
              <div className="grid gap-3">
                <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                  <button className="w-full px-4 py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-gray-100 transition-colors">
                    Start for free
                  </button>
                </Link>
                <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                  <button className="w-full px-4 py-2.5 text-sm font-semibold text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
                    Log in
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-2 py-3">
                <img
                  src={session.user.profilepic || session.user.image || "/images/default-profilepic.svg"}
                  alt={session.user.name}
                  className="w-10 h-10 rounded-full border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
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
