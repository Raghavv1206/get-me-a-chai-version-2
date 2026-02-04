'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CampaignCover({ coverImage, title }) {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Parallax effect - slower scroll for background
    const parallaxOffset = scrollY * 0.5;

    return (
        <div className="campaign-cover-container">
            <div
                className="campaign-cover-wrapper"
                style={{ transform: `translateY(${parallaxOffset}px)` }}
            >
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="campaign-cover-image"
                        priority
                        sizes="100vw"
                    />
                ) : (
                    <div className="campaign-cover-placeholder">
                        <div className="placeholder-gradient"></div>
                    </div>
                )}
                <div className="campaign-cover-overlay"></div>
            </div>

            <style jsx>{`
        .campaign-cover-container {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .campaign-cover-wrapper {
          position: relative;
          width: 100%;
          height: 120%;
          will-change: transform;
        }

        .campaign-cover-image {
          object-fit: cover;
        }

        .campaign-cover-placeholder {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .placeholder-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, 
            #667eea 0%, 
            #764ba2 50%, 
            #f093fb 100%
          );
          animation: gradientShift 10s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .campaign-cover-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .campaign-cover-container {
            height: 250px;
          }
        }
      `}</style>
        </div>
    );
}
