'use client';

import { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaEye } from 'react-icons/fa';

export default function ThankYouTemplates({ supporter, onSend, onClose }) {
    const [selectedTemplate, setSelectedTemplate] = useState('basic');
    const [customMessage, setCustomMessage] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [sending, setSending] = useState(false);

    const templates = [
        {
            id: 'basic',
            name: 'Basic Thank You',
            subject: 'Thank you for your support!',
            content: `Dear {name},

Thank you so much for your generous donation of ₹{amount} to {campaign}!

Your support means the world to us and will help us achieve our goals.

With gratitude,
The Team`
        },
        {
            id: 'detailed',
            name: 'Detailed Appreciation',
            subject: 'Your support is making a difference!',
            content: `Hi {name},

We wanted to take a moment to express our heartfelt gratitude for your contribution of ₹{amount} to {campaign}.

Thanks to supporters like you, we're {progress}% closer to our goal. Your generosity is helping us make a real impact.

We'll keep you updated on our progress and how your contribution is being used.

Thank you for believing in our mission!

Warm regards,
The Team`
        },
        {
            id: 'milestone',
            name: 'Milestone Celebration',
            subject: 'We did it - thanks to you!',
            content: `Dear {name},

Amazing news! Thanks to your generous support of ₹{amount}, we've reached an important milestone in our {campaign} campaign!

Your contribution was instrumental in helping us get here. We couldn't have done it without supporters like you.

Stay tuned for more updates as we continue working towards our goal.

With immense gratitude,
The Team`
        },
        {
            id: 'custom',
            name: 'Custom Message',
            subject: 'Thank you!',
            content: ''
        }
    ];

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

    const replacePlaceholders = (text) => {
        if (!supporter) return text;

        return text
            .replace(/{name}/g, supporter.name || 'Supporter')
            .replace(/{amount}/g, supporter.lastAmount?.toLocaleString('en-IN') || '0')
            .replace(/{campaign}/g, supporter.lastCampaign || 'our campaign')
            .replace(/{progress}/g, '75'); // Would be calculated dynamically
    };

    const getMessage = () => {
        if (selectedTemplate === 'custom') {
            return customMessage;
        }
        return selectedTemplateData?.content || '';
    };

    const handleSend = async () => {
        setSending(true);
        try {
            await onSend({
                to: supporter.email,
                subject: selectedTemplateData.subject,
                message: replacePlaceholders(getMessage())
            });
            onClose();
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    <FaEnvelope /> Send Thank You Email
                </h2>
                <p className="modal-subtitle">To: {supporter?.email}</p>

                <div className="template-selector">
                    <label className="selector-label">Choose Template:</label>
                    <div className="template-buttons">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTemplate === 'custom' ? (
                    <div className="custom-editor">
                        <label className="editor-label">Your Message:</label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Write your custom message here..."
                            className="message-textarea"
                            rows="10"
                        />
                        <p className="editor-hint">
                            Use placeholders: {'{name}'}, {'{amount}'}, {'{campaign}'}
                        </p>
                    </div>
                ) : (
                    <div className="template-preview">
                        <div className="preview-header">
                            <label className="preview-label">Message Preview:</label>
                            <button
                                className="preview-toggle"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                <FaEye /> {showPreview ? 'Hide' : 'Show'} Preview
                            </button>
                        </div>

                        {showPreview && (
                            <div className="preview-box">
                                <div className="preview-subject">
                                    <strong>Subject:</strong> {selectedTemplateData.subject}
                                </div>
                                <div className="preview-message">
                                    {replacePlaceholders(selectedTemplateData.content)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose} disabled={sending}>
                        Cancel
                    </button>
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={sending || (selectedTemplate === 'custom' && !customMessage.trim())}
                    >
                        {sending ? (
                            <>
                                <div className="spinner"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane /> Send Email
                            </>
                        )}
                    </button>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
          }

          .modal-content {
            background: white;
            border-radius: 24px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 32px;
          }

          .modal-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
          }

          .modal-subtitle {
            font-size: 1rem;
            color: #6b7280;
            margin: 0 0 24px 0;
          }

          .template-selector {
            margin-bottom: 24px;
          }

          .selector-label {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          }

          .template-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          }

          .template-btn {
            padding: 12px 16px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #374151;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .template-btn:hover {
            border-color: #d1d5db;
            background: #f9fafb;
          }

          .template-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
          }

          .custom-editor {
            margin-bottom: 24px;
          }

          .editor-label {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          }

          .message-textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 0.95rem;
            font-family: inherit;
            resize: vertical;
            transition: all 0.3s ease;
          }

          .message-textarea:focus {
            outline: none;
            border-color: #667eea;
          }

          .editor-hint {
            font-size: 0.85rem;
            color: #9ca3af;
            margin: 8px 0 0 0;
          }

          .template-preview {
            margin-bottom: 24px;
          }

          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .preview-label {
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
          }

          .preview-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .preview-toggle:hover {
            background: #f3f4f6;
          }

          .preview-box {
            padding: 20px;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
          }

          .preview-subject {
            font-size: 0.95rem;
            color: #374151;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .preview-message {
            font-size: 0.95rem;
            color: #374151;
            line-height: 1.8;
            white-space: pre-wrap;
          }

          .modal-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .cancel-btn,
          .send-btn {
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .cancel-btn {
            background: white;
            color: #6b7280;
            border: 2px solid #e5e7eb;
          }

          .cancel-btn:hover:not(:disabled) {
            background: #f9fafb;
          }

          .send-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
          }

          .send-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .cancel-btn:disabled,
          .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 640px) {
            .modal-content {
              padding: 24px;
            }

            .template-buttons {
              grid-template-columns: 1fr;
            }

            .modal-actions {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
