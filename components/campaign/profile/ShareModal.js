'use client';

import { useState } from 'react';
import {
  FaTimes,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaCopy,
  FaCheck
} from 'react-icons/fa';

export default function ShareModal({ campaignId, campaignTitle, creatorUsername, onClose }) {
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState(null);

  const campaignUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${creatorUsername}?campaign=${campaignId}`
    : '';

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${creatorUsername}?campaign=${campaignId}&ref=${Date.now()}`
    : '';

  const shareText = `Support ${campaignTitle} by ${creatorUsername} on Get Me A Chai!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'from-green-500 to-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + campaignUrl)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'from-blue-400 to-blue-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}&hashtags=GetMeAChai,Crowdfunding`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'from-blue-600 to-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'from-blue-700 to-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'from-red-500 to-red-600',
      url: `mailto:?subject=${encodeURIComponent(campaignTitle)}&body=${encodeURIComponent(shareText + '\n\n' + campaignUrl)}`
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Share Campaign</h2>
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            onClick={onClose}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:scale-105 transition-all group"
              >
                <div className={`p-3 bg-gradient-to-br ${link.color} rounded-xl`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Campaign Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={campaignUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all whitespace-nowrap"
                onClick={handleCopyLink}
              >
                {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Your Referral Link
            </label>
            <p className="text-xs text-gray-500 mb-2">Track who clicks your link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all whitespace-nowrap"
                onClick={handleCopyReferral}
              >
                {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {referralStats && (
              <p className="mt-2 text-sm text-purple-400 font-medium">
                {referralStats.clicks} people clicked your link
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
