'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProgressBar from './ProgressBar';
import MilestonesSection from './MilestonesSection';
import RewardTiers from './RewardTiers';
import FAQAccordion from './FAQAccordion';
import { FaClock, FaImage } from 'react-icons/fa';

export default function AboutTab({ campaign, onSelectReward }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const daysLeft = campaign.daysRemaining || 0;
  const images = campaign.images || [];
  const displayImages = showAllImages ? images : images.slice(0, 6);

  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="about-tab">
      {/* Campaign Overview Card */}
      <div className="overview-card">
        <ProgressBar
          current={campaign.currentAmount || 0}
          goal={campaign.goalAmount}
          milestones={campaign.milestones}
          animated={true}
        />

        <div className="overview-meta">
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <div>
              <div className="meta-value">{daysLeft}</div>
              <div className="meta-label">Days Left</div>
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-icon">❤️</div>
            <div>
              <div className="meta-value">{campaign.stats?.supporters || 0}</div>
              <div className="meta-label">Supporters</div>
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-icon">👁️</div>
            <div>
              <div className="meta-value">{campaign.stats?.views || 0}</div>
              <div className="meta-label">Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Story */}
      <div className="story-section">
        <h2 className="section-title">Campaign Story</h2>

        {campaign.hook && (
          <div className="story-hook">
            {campaign.hook}
          </div>
        )}

        <div className="story-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {campaign.story}
          </ReactMarkdown>
        </div>

        {campaign.aiGenerated && (
          <div className="ai-badge">
            ✨ Enhanced with AI
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {images.length > 0 && (
        <div className="media-gallery">
          <h3 className="section-title">
            <FaImage className="title-icon" />
            Media Gallery ({images.length})
          </h3>

          <div className="gallery-grid">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => setLightboxIndex(index)}
              >
                <Image
                  src={image}
                  alt={`Campaign image ${index + 1}`}
                  fill
                  className="gallery-image"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="gallery-overlay">
                  <span>View</span>
                </div>
              </div>
            ))}
          </div>

          {images.length > 6 && !showAllImages && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllImages(true)}
            >
              Show All {images.length} Images
            </button>
          )}
        </div>
      )}

      {/* Video */}
      {campaign.videoUrl && (
        <div className="video-section">
          <h3 className="section-title">Campaign Video</h3>
          <div className="video-wrapper">
            <iframe
              src={campaign.videoUrl}
              title="Campaign Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            ></iframe>
          </div>
        </div>
      )}

      {/* Milestones */}
      {campaign.milestones && campaign.milestones.length > 0 && (
        <MilestonesSection
          milestones={campaign.milestones}
          currentAmount={campaign.currentAmount || 0}
        />
      )}

      {/* Rewards */}
      {campaign.rewards && campaign.rewards.length > 0 && (
        <RewardTiers
          rewards={campaign.rewards}
          onSelectReward={onSelectReward}
        />
      )}

      {/* FAQs */}
      {campaign.faqs && campaign.faqs.length > 0 && (
        <FAQAccordion faqs={campaign.faqs} />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex]}
              alt={`Campaign image ${lightboxIndex + 1}`}
              fill
              className="lightbox-image"
              sizes="100vw"
            />
          </div>
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <style jsx>{`
        .about-tab {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .overview-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .overview-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid #f3f4f6;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meta-icon {
          font-size: 1.5rem;
          color: #667eea;
        }

        .meta-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .meta-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .story-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: #667eea;
        }

        .story-hook {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #667eea;
          border-radius: 8px;
        }

        .story-content {
          color: #4b5563;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .story-content :global(h1),
        .story-content :global(h2),
        .story-content :global(h3) {
          font-weight: 700;
          color: #111827;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .story-content :global(h1) {
          font-size: 1.75rem;
        }

        .story-content :global(h2) {
          font-size: 1.5rem;
        }

        .story-content :global(h3) {
          font-size: 1.25rem;
        }

        .story-content :global(p) {
          margin-bottom: 16px;
        }

        .story-content :global(strong) {
          font-weight: 700;
          color: #111827;
        }

        .story-content :global(ul),
        .story-content :global(ol) {
          margin-left: 24px;
          margin-bottom: 16px;
        }

        .story-content :global(li) {
          margin-bottom: 8px;
        }

        .story-content :global(a) {
          color: #667eea;
          text-decoration: underline;
        }

        .story-content :global(a:hover) {
          color: #5568d3;
        }

        .ai-badge {
          display: inline-block;
          margin-top: 20px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .media-gallery {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover {
          transform: scale(1.05);
        }

        .gallery-image {
          object-fit: cover;
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .show-more-btn {
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .show-more-btn:hover {
          background: #f9fafb;
          border-color: #667eea;
        }

        .video-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 12px;
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          aspect-ratio: 16/9;
        }

        .lightbox-image {
          object-fit: contain;
        }

        .lightbox-close,
        .lightbox-prev,
        .lightbox-next {
          position: absolute;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 12px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
          z-index: 2001;
        }

        .lightbox-close {
          top: 20px;
          right: 20px;
        }

        .lightbox-prev {
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .lightbox-next {
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }

        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .lightbox-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .overview-meta {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .story-hook {
            font-size: 1.1rem;
            padding: 16px;
          }

          .story-content {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
