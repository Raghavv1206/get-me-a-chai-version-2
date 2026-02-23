'use client';

import { useState } from 'react';
import { Bell, Mail, Save, Wallet, PartyPopper, MessageCircle, FileEdit, Settings } from 'lucide-react';
import { toast } from '@/lib/apiToast';

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
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'payment', label: 'Payment Received', icon: <Wallet className="w-6 h-6 text-green-400" />, description: 'When you receive a new payment' },
    { key: 'milestone', label: 'Milestone Reached', icon: <PartyPopper className="w-6 h-6 text-yellow-400" />, description: 'When your campaign reaches a milestone' },
    { key: 'comment', label: 'New Comments', icon: <MessageCircle className="w-6 h-6 text-blue-400" />, description: 'When someone comments on your campaign' },
    { key: 'update', label: 'Campaign Updates', icon: <FileEdit className="w-6 h-6 text-purple-400" />, description: 'Updates from campaigns you support' },
    { key: 'system', label: 'System Notifications', icon: <Settings className="w-6 h-6 text-gray-400" />, description: 'Important system announcements' }
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Bell className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
          <p className="text-sm text-gray-400 mt-1">Manage how you receive notifications</p>
        </div>
      </div>

      {/* Email Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Email Notifications</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Choose which notifications you want to receive via email
        </p>

        <div className="space-y-3">
          {notificationTypes.map(type => (
            <div
              key={type.key}
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800/70 border border-white/5 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl flex-shrink-0">{type.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">{type.label}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications[type.key]}
                  onChange={() => handleToggle(type.key)}
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Email Frequency Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Email Frequency</h3>
        <p className="text-sm text-gray-400 mb-6">
          How often should we send you email notifications?
        </p>

        <div className="space-y-3">
          <label className="flex items-start gap-4 p-4 border-2 border-white/10 hover:border-purple-500/50 rounded-xl cursor-pointer transition-all duration-200 group">
            <input
              type="radio"
              name="frequency"
              value="realtime"
              checked={settings.frequency === 'realtime'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
              className="mt-1 w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Real-time</h4>
              <p className="text-xs text-gray-400 mt-0.5">Receive emails immediately as notifications arrive</p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border-2 border-white/10 hover:border-purple-500/50 rounded-xl cursor-pointer transition-all duration-200 group">
            <input
              type="radio"
              name="frequency"
              value="daily"
              checked={settings.frequency === 'daily'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
              className="mt-1 w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Daily Digest</h4>
              <p className="text-xs text-gray-400 mt-0.5">Receive a daily summary of all notifications</p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border-2 border-white/10 hover:border-purple-500/50 rounded-xl cursor-pointer transition-all duration-200 group">
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={settings.frequency === 'weekly'}
              onChange={(e) => setSettings({ ...settings, frequency: e.target.value })}
              className="mt-1 w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Weekly Digest</h4>
              <p className="text-xs text-gray-400 mt-0.5">Receive a weekly summary every Monday</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
