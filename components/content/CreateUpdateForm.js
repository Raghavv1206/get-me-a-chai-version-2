'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import RichTextEditor from './RichTextEditor';
import SchedulePublishModal from './SchedulePublishModal';
import UpdatePreview from './UpdatePreview';
import { FaEye, FaSave, FaPaperPlane, FaClock } from 'react-icons/fa';
import { toast } from '@/lib/apiToast';

export default function CreateUpdateForm({ campaigns, initialData, onSave }) {
  const previewRef = useRef(null);

  // Prevent page scroll when scrolling inside preview
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      // Only prevent default if we can scroll in the direction
      if (!atTop && !atBottom) {
        e.preventDefault();
        el.scrollTop += e.deltaY;
      } else if (scrollHeight > clientHeight) {
        // At boundary but element is scrollable — still prevent page scroll
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  });

  const [formData, setFormData] = useState({
    campaign: initialData?.campaign || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    visibility: initialData?.visibility || 'public',
    status: initialData?.status || 'draft'
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (action) => {
    if (!formData.campaign || !formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        status: action === 'publish' ? 'published' : 'draft'
      };

      const result = await onSave(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Update ${action === 'publish' ? 'published' : 'saved'} successfully!`);
      }
    } catch (error) {
      console.error('Error saving update:', error);
      toast.error('Failed to save update');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async (scheduledDate) => {
    if (!formData.campaign || !formData.title || !formData.content) {
      toast.error('Please fill in all required fields before scheduling');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        status: 'scheduled',
        scheduledFor: scheduledDate
      };

      const result = await onSave(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setShowScheduleModal(false);
        toast.success('Update scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling update:', error);
      toast.error('Failed to schedule update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-update-form">
      <div className="form-header">
        <h2 className="form-title">
          {initialData ? 'Edit Update' : 'Create New Update'}
        </h2>
        <button
          type="button"
          className="preview-btn"
          onClick={() => setShowPreview(!showPreview)}
        >
          <FaEye /> {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className={`form-layout ${showPreview ? 'with-preview' : ''}`}>
        <div className="form-main">
          <div className="form-group">
            <label className="form-label">Campaign *</label>
            <select
              value={formData.campaign}
              onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Select a campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter update title..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="form-select"
              >
                <option value="public">Public</option>
                <option value="supporters">Supporters Only</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
            >
              <FaSave /> Save as Draft
            </button>

            <button
              type="button"
              className="btn-schedule"
              onClick={() => setShowScheduleModal(true)}
              disabled={saving}
            >
              <FaClock /> Schedule
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSubmit('publish')}
              disabled={saving}
            >
              <FaPaperPlane /> {saving ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="form-preview" ref={previewRef}>
            <UpdatePreview
              title={formData.title}
              content={formData.content}
              campaign={campaigns.find(c => c._id === formData.campaign)}
            />
          </div>
        )}
      </div>

      {showScheduleModal && (
        <SchedulePublishModal
          onSchedule={handleSchedule}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      <style jsx global>{`
        .create-update-form {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 32px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f3f4f6;
          margin: 0;
        }

        .preview-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-weight: 600;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preview-btn:hover {
          border-color: rgba(139, 92, 246, 0.5);
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
        }

        .form-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .form-layout.with-preview {
          grid-template-columns: 1fr 400px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #d1d5db;
          margin-bottom: 8px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 1rem;
          color: #f3f4f6;
          transition: all 0.3s ease;
        }

        .form-input::placeholder {
          color: #6b7280;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .form-select option {
          background: #1f2937;
          color: #f3f4f6;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
        }

        .btn-secondary,
        .btn-schedule,
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #d1d5db;
        }

        .btn-schedule {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .btn-schedule:hover:not(:disabled) {
          background: rgba(245, 158, 11, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        .btn-secondary:disabled,
        .btn-schedule:disabled,
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-preview {
          position: sticky;
          top: 100px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          border-radius: 16px;
        }

        .form-preview::-webkit-scrollbar {
          width: 6px;
        }

        .form-preview::-webkit-scrollbar-track {
          background: transparent;
        }

        .form-preview::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .form-preview::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        @media (max-width: 1024px) {
          .form-layout {
            grid-template-columns: 1fr;
          }

          .form-preview {
            position: static;
            max-height: 500px;
          }
        }

        @media (max-width: 640px) {
          .create-update-form {
            padding: 20px;
          }

          .form-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-secondary,
          .btn-schedule,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
