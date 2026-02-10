'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MilestonesSection from './MilestonesSection';
import RewardTiers from './RewardTiers';
import FAQAccordion from './FAQAccordion';
import { FaClock, FaImage, FaHeart, FaEye, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    <div className="space-y-8">
      {/* Campaign Story */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-purple-400">📖</span>
          Campaign Story
        </h2>

        {campaign.hook && (
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-l-4 border-purple-500 rounded-lg">
            <p className="text-lg text-gray-200 leading-relaxed font-medium">
              {campaign.hook}
            </p>
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="text-gray-300 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 text-gray-300" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                a: ({ node, ...props }) => <a className="text-purple-400 hover:text-purple-300 underline" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              }}
            >
              {campaign.story}
            </ReactMarkdown>
          </div>
        </div>

        {campaign.aiGenerated && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-400">✨</span>
            <span className="text-sm font-semibold text-yellow-300">Enhanced with AI</span>
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {images.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaImage className="text-purple-400" />
            Media Gallery ({images.length})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <Image
                  src={image}
                  alt={`Campaign image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold">View</span>
                </div>
              </div>
            ))}
          </div>

          {images.length > 6 && !showAllImages && (
            <button
              className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-purple-400 font-semibold hover:bg-white/10 transition-all"
              onClick={() => setShowAllImages(true)}
            >
              Show All {images.length} Images
            </button>
          )}
        </div>
      )}

      {/* Video */}
      {campaign.videoUrl && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Campaign Video</h3>
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl">
            <iframe
              src={campaign.videoUrl}
              title="Campaign Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
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
        <div
          className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all z-[2001]"
            onClick={closeLightbox}
          >
            <FaTimes className="w-6 h-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all z-[2001]"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all z-[2001]"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            <FaChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[90vh] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`Campaign image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
