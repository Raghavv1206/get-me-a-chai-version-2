// C:\Users\ragha\project\get-me-a-chai\components\Footer.js
"use client"
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'About',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Success Stories', href: '/stories' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' }
      ]
    },
    {
      title: 'For Creators',
      links: [
        { name: 'Start a Campaign', href: '/login' },
        { name: 'Creator Guide', href: '/guide' },
        { name: 'AI Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Resources', href: '/resources' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Safety', href: '/safety' },
        { name: 'Trust & Security', href: '/trust' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Guidelines', href: '/guidelines' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: 'https://twitter.com', gradient: 'from-gray-700 to-gray-900' },
    { name: 'Facebook', icon: '📘', href: 'https://facebook.com', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Instagram', icon: '📷', href: 'https://instagram.com', gradient: 'from-pink-500 to-purple-600' },
    { name: 'LinkedIn', icon: '💼', href: 'https://linkedin.com', gradient: 'from-blue-500 to-blue-700' },
    { name: 'YouTube', icon: '▶️', href: 'https://youtube.com', gradient: 'from-red-500 to-red-700' }
  ];

  return (
    <footer className="relative bg-gray-950 border-t border-gray-800">
      {/* Animated gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <img src="/tea.gif" alt="Chai" className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Get Me a Chai
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Empowering creators with AI-powered crowdfunding. Turn your passion into reality with community support.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group w-10 h-10 bg-gradient-to-br ${social.gradient} rounded-lg flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-xl`}
                  title={social.name}
                >
                  <span className="text-white text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      {link.name}
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup section */}
        <div className="border-t border-gray-800 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest news, tips, and success stories delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} <span className="font-semibold text-white">Get Me a Chai</span>. All rights reserved.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>SSL Secure</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>PCI Compliant</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center text-white font-bold text-xs">
                  AI
                </div>
                <span>AI Powered</span>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Built with ❤️ in India | Powered by AI & Innovation
            </p>
          </div>
        </div>
      </div>

      {/* Animated gradient bottom accent */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </footer>
  );
}