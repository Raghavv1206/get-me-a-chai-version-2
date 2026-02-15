'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaCheckCircle, FaTwitter, FaLinkedin, FaGithub, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

export default function ProfileHeader({
  profilePic,
  name,
  username,
  bio,
  category,
  location,
  socialLinks,
  verified
}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const bioLimit = 150;
  const shouldTruncate = bio && bio.length > bioLimit;

  return (
    <div className="profile-header">
      <div className="profile-header-container">
        {/* Profile Picture */}
        <div className="profile-picture-wrapper">
          <div className="profile-picture">
            <Image
              src={profilePic || '/images/default-profilepic.svg'}
              alt={name}
              fill
              className="profile-image"
              sizes="(max-width: 768px) 120px, 150px"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {name}
              {verified && (
                <FaCheckCircle className="verified-badge" title="Verified Creator" />
              )}
            </h1>
            <p className="profile-username">@{username}</p>
          </div>

          {/* Category and Location */}
          <div className="profile-meta">
            {category && (
              <span className="category-badge">{category}</span>
            )}
            {location && (
              <span className="location">
                <FaMapMarkerAlt className="location-icon" />
                {location}
              </span>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="profile-bio">
              <p className={bioExpanded ? 'bio-expanded' : 'bio-collapsed'}>
                {shouldTruncate && !bioExpanded
                  ? `${bio.substring(0, bioLimit)}...`
                  : bio
                }
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="bio-toggle"
                >
                  {bioExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Social Links */}
          {socialLinks && Object.values(socialLinks).some(link => link) && (
            <div className="social-links">
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaTwitter />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaLinkedin />
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaGithub />
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaGlobe />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-header {
          position: relative;
          margin-top: -80px;
          padding: 0 20px 30px;
          z-index: 10;
        }

        .profile-header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 30px;
          align-items: flex-start;
        }

        .profile-picture-wrapper {
          flex-shrink: 0;
        }

        .profile-picture {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 5px solid #1e293b;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          background: #1e293b;
        }

        .profile-image {
          object-fit: cover;
        }

        .profile-info {
          flex: 1;
          padding-top: 40px;
        }

        .profile-name-section {
          margin-bottom: 12px;
        }

        .profile-name {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0 0 5px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .verified-badge {
          color: #3b82f6;
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .profile-username {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
        }

        .profile-meta {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .category-badge {
          display: inline-block;
          padding: 6px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.95);
          font-size: 0.95rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
        }

        .location-icon {
          font-size: 0.9rem;
        }

        .profile-bio {
          margin-bottom: 15px;
          max-width: 700px;
        }

        .profile-bio p {
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin: 0 0 8px 0;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
        }

        .bio-toggle {
          background: none;
          border: none;
          color: #60a5fa;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .bio-toggle:hover {
          color: #93c5fd;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .profile-header {
            margin-top: -60px;
            padding: 0 15px 20px;
          }

          .profile-header-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 20px;
          }

          .profile-picture {
            width: 120px;
            height: 120px;
          }

          .profile-info {
            padding-top: 0;
          }

          .profile-name {
            font-size: 1.5rem;
            justify-content: center;
          }

          .profile-meta {
            justify-content: center;
          }

          .social-links {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
