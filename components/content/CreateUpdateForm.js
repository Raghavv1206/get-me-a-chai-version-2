'use client';

import { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import SchedulePublishModal from './SchedulePublishModal';
import UpdatePreview from './UpdatePreview';
import { FaEye, FaSave, FaPaperPlane, FaClock } from 'react-icons/fa';

export default function CreateUpdateForm({ campaigns, initialData, onSave }) {
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
            alert('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const data = {
                ...formData,
                status: action === 'publish' ? 'published' : 'draft'
            };

            await onSave(data);
            alert(`Update ${action === 'publish' ? 'published' : 'saved'} successfully!`);
        } catch (error) {
            console.error('Error saving update:', error);
            alert('Failed to save update');
        } finally {
            setSaving(false);
        }
    };

    const handleSchedule = async (scheduledDate) => {
        setSaving(true);
        try {
            const data = {
                ...formData,
                status: 'scheduled',
                scheduledFor: scheduledDate
            };

            await onSave(data);
            setShowScheduleModal(false);
            alert('Update scheduled successfully!');
        } catch (error) {
            console.error('Error scheduling update:', error);
            alert('Failed to schedule update');
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

            <div className="form-layout">
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
                    <div className="form-preview">
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

            <style jsx>{`
        .create-update-form {
          background: white;
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
          color: #111827;
          margin: 0;
        }

        .preview-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preview-btn:hover {
          border-color: #667eea;
          color: #667eea;
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
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #667eea;
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
          border-top: 2px solid #f3f4f6;
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
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f9fafb;
        }

        .btn-schedule {
          background: white;
          color: #f59e0b;
          border: 2px solid #f59e0b;
        }

        .btn-schedule:hover:not(:disabled) {
          background: #fffbeb;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary:disabled,
        .btn-schedule:disabled,
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-preview {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        @media (max-width: 1024px) {
          .form-layout {
            grid-template-columns: 1fr;
          }

          .form-preview {
            position: static;
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
