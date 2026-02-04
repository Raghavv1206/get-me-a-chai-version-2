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
            color: '#25D366',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + campaignUrl)}`
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            color: '#1DA1F2',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}&hashtags=GetMeAChai,Crowdfunding`
        },
        {
            name: 'Facebook',
            icon: FaFacebook,
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            color: '#0A66C2',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`
        },
        {
            name: 'Email',
            icon: FaEnvelope,
            color: '#EA4335',
            url: `mailto:?subject=${encodeURIComponent(campaignTitle)}&body=${encodeURIComponent(shareText + '\n\n' + campaignUrl)}`
        }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Share Campaign</h2>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Social Share Buttons */}
                    <div className="share-buttons">
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-button"
                                style={{ '--button-color': link.color }}
                            >
                                <link.icon className="share-icon" />
                                <span className="share-label">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="copy-section">
                        <label className="section-label">Campaign Link</label>
                        <div className="copy-input-wrapper">
                            <input
                                type="text"
                                value={campaignUrl}
                                readOnly
                                className="copy-input"
                            />
                            <button
                                className="copy-button"
                                onClick={handleCopyLink}
                            >
                                {copied ? <FaCheck /> : <FaCopy />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Referral Link (if logged in) */}
                    <div className="copy-section">
                        <label className="section-label">
                            Your Referral Link
                            <span className="section-hint">Track who clicks your link</span>
                        </label>
                        <div className="copy-input-wrapper">
                            <input
                                type="text"
                                value={referralUrl}
                                readOnly
                                className="copy-input"
                            />
                            <button
                                className="copy-button"
                                onClick={handleCopyReferral}
                            >
                                {copied ? <FaCheck /> : <FaCopy />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        {referralStats && (
                            <p className="referral-stats">
                                {referralStats.clicks} people clicked your link
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .modal-body {
          padding: 24px;
        }

        .share-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 30px;
        }

        .share-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          text-decoration: none;
          color: var(--button-color);
          transition: all 0.3s ease;
        }

        .share-button:hover {
          background: var(--button-color);
          color: white;
          border-color: var(--button-color);
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .share-icon {
          font-size: 1.75rem;
        }

        .share-label {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .copy-section {
          margin-bottom: 24px;
        }

        .copy-section:last-child {
          margin-bottom: 0;
        }

        .section-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .section-hint {
          font-size: 0.8rem;
          font-weight: 400;
          color: #9ca3af;
        }

        .copy-input-wrapper {
          display: flex;
          gap: 8px;
        }

        .copy-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.9rem;
          color: #6b7280;
          background: #f9fafb;
        }

        .copy-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .copy-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .copy-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .referral-stats {
          margin-top: 8px;
          font-size: 0.85rem;
          color: #667eea;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .modal-content {
            border-radius: 16px;
          }

          .modal-header,
          .modal-body {
            padding: 20px;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .share-buttons {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .share-button {
            padding: 12px;
          }

          .share-icon {
            font-size: 1.5rem;
          }

          .share-label {
            font-size: 0.75rem;
          }

          .copy-input-wrapper {
            flex-direction: column;
          }

          .copy-button {
            justify-content: center;
          }
        }
      `}</style>
        </div>
    );
}
