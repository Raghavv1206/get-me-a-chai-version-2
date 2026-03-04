'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, Mail, Monitor, Save, Wallet, PartyPopper, MessageCircle,
  FileEdit, Settings, Rocket, CreditCard, UserPlus, Reply,
  CheckCircle2, Loader2, RotateCcw, Send, AlertTriangle,
  Newspaper, ShieldCheck, WifiOff
} from 'lucide-react';

const DEFAULT_PREFERENCES = {
  email: {
    payment: true, milestone: true, comment: true, update: true,
    system: true, campaign: true, subscription: true, follow: true, reply: true,
  },
  inApp: {
    payment: true, milestone: true, comment: true, update: true,
    system: true, campaign: true, subscription: true, follow: true, reply: true,
  },
  frequency: 'realtime',
  newsletter: true,
};

const NOTIFICATION_TYPES = [
  { key: 'payment', label: 'Payment Received', icon: Wallet, iconColor: 'text-green-400', bgColor: 'bg-green-500/20', description: 'When you receive a new payment or donation' },
  { key: 'milestone', label: 'Milestone Reached', icon: PartyPopper, iconColor: 'text-yellow-400', bgColor: 'bg-yellow-500/20', description: 'When your campaign reaches a funding milestone' },
  { key: 'comment', label: 'New Comments', icon: MessageCircle, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/20', description: 'When someone comments on your campaign' },
  { key: 'reply', label: 'Comment Replies', icon: Reply, iconColor: 'text-cyan-400', bgColor: 'bg-cyan-500/20', description: 'When someone replies to your comment' },
  { key: 'update', label: 'Campaign Updates', icon: FileEdit, iconColor: 'text-purple-400', bgColor: 'bg-purple-500/20', description: 'Updates from campaigns you support' },
  { key: 'campaign', label: 'Campaign Status', icon: Rocket, iconColor: 'text-indigo-400', bgColor: 'bg-indigo-500/20', description: 'When your campaign status changes' },
  { key: 'subscription', label: 'Subscriptions', icon: CreditCard, iconColor: 'text-pink-400', bgColor: 'bg-pink-500/20', description: 'Subscription events (new, cancelled, charged)' },
  { key: 'follow', label: 'New Followers', icon: UserPlus, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/20', description: 'When someone follows you' },
  { key: 'system', label: 'System Notifications', icon: Settings, iconColor: 'text-gray-400', bgColor: 'bg-gray-500/20', description: 'Important system announcements (always on)', alwaysOn: true },
];

/**
 * Deep-compare two preference objects to detect changes
 */
function prefsEqual(a, b) {
  if (!a || !b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState(DEFAULT_PREFERENCES);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [emailConfigured, setEmailConfigured] = useState(null); // null = unknown, true/false
  const [resetting, setResetting] = useState(false);
  const savedTimerRef = useRef(null);
  const testResultTimerRef = useRef(null);

  const hasUnsavedChanges = !prefsEqual(settings, savedSettings);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (testResultTimerRef.current) clearTimeout(testResultTimerRef.current);
    };
  }, []);

  // Load preferences from the server on mount
  useEffect(() => {
    loadPreferences();
    checkEmailConfig();
  }, []);

  // Warn user about unsaved changes on page leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/preferences');

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }

      const data = await res.json();
      if (data.success && data.preferences) {
        const loaded = {
          email: { ...DEFAULT_PREFERENCES.email, ...data.preferences.email },
          inApp: { ...DEFAULT_PREFERENCES.inApp, ...data.preferences.inApp },
          frequency: data.preferences.frequency || 'realtime',
          newsletter: data.preferences.newsletter !== false,
        };
        setSettings(loaded);
        setSavedSettings(loaded);
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to load preferences. Using defaults.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfig = async () => {
    try {
      const res = await fetch('/api/notifications/preferences/email-status');
      if (res.ok) {
        const data = await res.json();
        setEmailConfigured(data.configured ?? null);
      }
    } catch {
      // Non-critical, just hide the status
      setEmailConfigured(null);
    }
  };

  const handleToggle = useCallback((channel, type) => {
    // System notifications are always on for in-app
    if (type === 'system' && channel === 'inApp') return;

    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type],
      },
    }));
    setSaved(false);
    setTestEmailResult(null);
  }, []);

  const handleToggleAllChannel = useCallback((channel, enabled) => {
    setSettings(prev => {
      const updated = { ...prev[channel] };
      for (const key of Object.keys(updated)) {
        if (channel === 'inApp' && key === 'system') continue; // system always on
        updated[key] = enabled;
      }
      return { ...prev, [channel]: updated };
    });
    setSaved(false);
    setTestEmailResult(null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setSavedSettings({ ...settings }); // Mark as saved
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to save preferences. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = useCallback(async () => {
    setResetting(true);
    setError(null);
    try {
      // Save defaults to server
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_PREFERENCES),
      });

      if (!res.ok) throw new Error('Failed to reset preferences');

      const data = await res.json();
      if (data.success) {
        setSettings({ ...DEFAULT_PREFERENCES });
        setSavedSettings({ ...DEFAULT_PREFERENCES });
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to reset');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset preferences');
    } finally {
      setResetting(false);
    }
  }, []);

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/notifications/preferences/test-email', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        setTestEmailResult({ success: true, message: data.message || 'Test email sent! Check your inbox.' });
      } else {
        setTestEmailResult({ success: false, message: data.error || 'Failed to send test email.' });
      }
    } catch (err) {
      setTestEmailResult({ success: false, message: 'Network error. Could not send test email.' });
    } finally {
      setTestingEmail(false);
      if (testResultTimerRef.current) clearTimeout(testResultTimerRef.current);
      testResultTimerRef.current = setTimeout(() => setTestEmailResult(null), 8000);
    }
  };

  const handleDiscard = useCallback(() => {
    setSettings({ ...savedSettings });
    setSaved(false);
    setError(null);
    setTestEmailResult(null);
  }, [savedSettings]);

  // Check if all toggles in a channel are enabled
  const allEnabled = (channel) => {
    return Object.entries(settings[channel]).every(
      ([key, val]) => (channel === 'inApp' && key === 'system') ? true : val
    );
  };

  const allDisabled = (channel) => {
    return Object.entries(settings[channel]).every(
      ([key, val]) => (channel === 'inApp' && key === 'system') ? true : !val
    );
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Bell className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
            <p className="text-sm text-gray-400 mt-1">Loading your preferences...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Bell className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
            <p className="text-sm text-gray-400 mt-1">Choose how and when you receive notifications</p>
          </div>
        </div>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Email Service Status */}
      {emailConfigured !== null && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${emailConfigured
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
          {emailConfigured ? (
            <>
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-green-400">Email service is configured and ready to send notifications.</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-400">Email service is not configured. Email notifications will not be sent. Contact your administrator to set up SMTP.</span>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={loadPreferences}
            className="ml-auto text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Test Email Result */}
      {testEmailResult && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${testEmailResult.success
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
          }`}>
          {testEmailResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className={`text-sm ${testEmailResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testEmailResult.message}
          </span>
        </div>
      )}

      {/* Notification Channels - Table Header */}
      <div className="mb-4">
        <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px] gap-4 items-center px-4 pb-3 border-b border-white/10">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Notification Type</span>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In-App</span>
            </div>
            <button
              onClick={() => handleToggleAllChannel('inApp', !allEnabled('inApp'))}
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              {allEnabled('inApp') ? 'Disable all' : 'Enable all'}
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
            </div>
            <button
              onClick={() => handleToggleAllChannel('email', !allEnabled('email'))}
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              {allEnabled('email') ? 'Disable all' : 'Enable all'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Type Rows */}
      <div className="space-y-2">
        {NOTIFICATION_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <div
              key={type.key}
              className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px] gap-3 sm:gap-4 items-center p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-white/5 rounded-xl transition-all duration-200"
            >
              {/* Type info */}
              <div className="flex items-center gap-3">
                <div className={`p-2 ${type.bgColor} rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${type.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white">{type.label}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                </div>
              </div>

              {/* In-App Toggle */}
              <div className="flex items-center gap-2 sm:justify-center">
                <span className="sm:hidden text-xs text-gray-500">In-App:</span>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={type.alwaysOn || settings.inApp[type.key]}
                    onChange={() => handleToggle('inApp', type.key)}
                    disabled={type.alwaysOn}
                    aria-label={`In-app ${type.label}`}
                  />
                  <div className={`w-11 h-6 rounded-full peer transition-all duration-200 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${type.alwaysOn
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 opacity-60 cursor-not-allowed after:translate-x-full'
                    : 'bg-gray-700 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-purple-500/50'
                    }`}></div>
                </label>
              </div>

              {/* Email Toggle */}
              <div className="flex items-center gap-2 sm:justify-center">
                <span className="sm:hidden text-xs text-gray-500">Email:</span>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email[type.key]}
                    onChange={() => handleToggle('email', type.key)}
                    aria-label={`Email ${type.label}`}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Frequency Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-bold text-white mb-2">Email Frequency</h3>
        <p className="text-sm text-gray-400 mb-4">
          How often should we send you email notifications?
        </p>

        <div className="space-y-2">
          {[
            { value: 'realtime', label: 'Real-time', desc: 'Receive emails immediately as events happen' },
            { value: 'daily', label: 'Daily Digest', desc: 'Get a daily summary of all notifications (real-time emails paused)' },
            { value: 'weekly', label: 'Weekly Digest', desc: 'Receive a weekly summary every Monday (real-time emails paused)' },
          ].map(option => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${settings.frequency === option.value
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'
                }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={settings.frequency === option.value}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, frequency: e.target.value }));
                  setSaved(false);
                }}
                className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{option.label}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Newspaper className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Newsletter</h4>
              <p className="text-xs text-gray-400 mt-0.5">Receive weekly updates about new features and tips</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.newsletter}
              onChange={() => {
                setSettings(prev => ({ ...prev, newsletter: !prev.newsletter }));
                setSaved(false);
              }}
              aria-label="Newsletter subscription"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Test Email Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-bold text-white mb-2">Test Email</h3>
        <p className="text-sm text-gray-400 mb-4">
          Send a test email to verify your email notifications are working.
        </p>
        <button
          onClick={handleTestEmail}
          disabled={testingEmail || emailConfigured === false}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-purple-500/30"
        >
          {testingEmail ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {testingEmail ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>

        {/* Discard Changes */}
        {hasUnsavedChanges && (
          <button
            onClick={handleDiscard}
            className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
          >
            Discard Changes
          </button>
        )}

        {/* Reset to Defaults */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 disabled:bg-gray-800/30 disabled:cursor-not-allowed text-gray-400 hover:text-white font-medium rounded-xl transition-all duration-200 border border-white/10 ml-auto"
        >
          {resetting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          {resetting ? 'Resetting...' : 'Reset to Defaults'}
        </button>

        {/* Saved indicator */}
        {saved && (
          <span className="text-sm text-green-400 animate-fade-in">
            Preferences saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
