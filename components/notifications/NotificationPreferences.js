'use client';

import { useState } from 'react';
import { FaBell, FaEnvelope, FaSave } from 'react-icons/fa';

export default function NotificationPreferences({ preferences: initialPreferences, onSave }) {
  const [settings, setSettings] = useState(initialPreferences || {
    emailNotifications: {
      payment: true,
      milestone: true,
      comment: false,
      update: true,
      system: true
    },
    frequency: 'realtime'
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (type) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [type]: !settings.emailNotifications[type]
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If onSave prop is provided, use it; otherwise use default behavior
      if (onSave && typeof onSave === 'function') {
        await onSave(settings);
      } else {
        // Default behavior: save to localStorage
        localStorage.setItem('notificationPreferences', JSON.stringify(settings));
        console.log('Notification preferences saved:', settings);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'payment', label: 'Payment Received', icon: '💰', description: 'When you receive a new payment' },
    { key: 'milestone', label: 'Milestone Reached', icon: '🎉', description: 'When your campaign reaches a milestone' },
    { key: 'comment', label: 'New Comments', icon: '💬', description: 'When someone comments on your campaign' },
    { key: 'update', label: 'Campaign Updates', icon: '📝', description: 'Updates from campaigns you support' },
    { key: 'system', label: 'System Notifications', icon: '⚙️', description: 'Important system announcements' }
  ];

  return (
    <div className="notification-preferences">
      <div className="prefs-header">
        <FaBell className="header-icon" />
        <div>
          <h2 className="prefs-title">Notification Preferences</h2>
          <p className="prefs-subtitle">Manage how you receive notifications</p>
        </div>
      </div>

      <div className="prefs-section">
        <h3 className="section-title">
          <FaEnvelope /> Email Notifications
        </h3>
        <p className="section-description">
          Choose which notifications you want to receive via email
        </p>

        <div className="notification-types">
          {notificationTypes.map(type => (
            <div key={type.key} className="type-item">
              <div className="type-info">
                <span className="type-icon">{type.icon}</span>
                <div className="type-content">
                  <h4 className="type-label">{type.label}</h4>
                  <p className="type-description">{type.description}</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications[type.key]}
                  onChange={() => handleToggle(type.key)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="prefs-section">
        <h3 className="section-title">Email Frequency</h3>
        <p className="section-description">
          How often should we send you email notifications?
        </p>

        <div className="frequency-options">
          <label className="frequency-option">
            <input
              type="radio"
              name="frequency"
              value="realtime"
              checked={settings.frequency === 'realtime'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
            />
            <div className="option-content">
              <h4>Real-time</h4>
              <p>Receive emails immediately as notifications arrive</p>
            </div>
          </label>

          <label className="frequency-option">
            <input
              type="radio"
              name="frequency"
              value="daily"
              checked={settings.frequency === 'daily'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
            />
            <div className="option-content">
              <h4>Daily Digest</h4>
              <p>Receive a daily summary of all notifications</p>
            </div>
          </label>

          <label className="frequency-option">
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={settings.frequency === 'weekly'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
            />
            <div className="option-content">
              <h4>Weekly Digest</h4>
              <p>Receive a weekly summary every Monday</p>
            </div>
          </label>
        </div>
      </div>

      <div className="prefs-actions">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          <FaSave />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>

      <style jsx>{`
        .notification-preferences {
          background: white;
          border-radius: 16px;
          padding: 32px;
        }

        .prefs-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .header-icon {
          font-size: 2.5rem;
          color: #667eea;
        }

        .prefs-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .prefs-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .prefs-section {
          margin-bottom: 32px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .section-description {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0 0 20px 0;
        }

        .notification-types {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          gap: 20px;
        }

        .type-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .type-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .type-content {
          flex: 1;
        }

        .type-label {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .type-description {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }

        .toggle-switch {
          position: relative;
          width: 56px;
          height: 28px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          transition: 0.4s;
          border-radius: 28px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(28px);
        }

        .frequency-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .frequency-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .frequency-option:hover {
          border-color: #667eea;
          background: #f9fafb;
        }

        .frequency-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .option-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .option-content p {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }

        .prefs-actions {
          padding-top: 24px;
          border-top: 2px solid #f3f4f6;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .notification-preferences {
            padding: 20px;
          }

          .type-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .toggle-switch {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
