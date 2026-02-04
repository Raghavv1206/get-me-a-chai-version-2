'use client';

export default function UpdatePreview({ title, content, campaign }) {
    return (
        <div className="update-preview">
            <div className="preview-header">
                <h3 className="preview-title">Preview</h3>
                <p className="preview-subtitle">How your update will appear</p>
            </div>

            <div className="preview-content">
                {campaign && (
                    <div className="campaign-badge">
                        <span className="badge-label">Campaign:</span>
                        <span className="badge-value">{campaign.title}</span>
                    </div>
                )}

                <h1 className="content-title">
                    {title || <span className="placeholder">Untitled Update</span>}
                </h1>

                <div className="content-meta">
                    <span className="meta-item">By {campaign?.creator?.name || 'You'}</span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">{new Date().toLocaleDateString()}</span>
                </div>

                <div
                    className="content-html"
                    dangerouslySetInnerHTML={{
                        __html: content || '<p class="placeholder">Start writing your update...</p>'
                    }}
                />
            </div>

            <style jsx>{`
        .update-preview {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          height: fit-content;
        }

        .preview-header {
          padding: 20px;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .preview-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .preview-subtitle {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .preview-content {
          padding: 32px;
          max-height: 600px;
          overflow-y: auto;
        }

        .campaign-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #bfdbfe;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .badge-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
        }

        .badge-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .content-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        .content-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .meta-item {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .meta-divider {
          color: #d1d5db;
        }

        :global(.content-html) {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #374151;
        }

        :global(.content-html p) {
          margin: 0 0 20px 0;
        }

        :global(.content-html h1) {
          font-size: 2rem;
          font-weight: 700;
          margin: 32px 0 16px 0;
          color: #111827;
        }

        :global(.content-html h2) {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 28px 0 14px 0;
          color: #111827;
        }

        :global(.content-html h3) {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 24px 0 12px 0;
          color: #111827;
        }

        :global(.content-html ul),
        :global(.content-html ol) {
          padding-left: 28px;
          margin: 0 0 20px 0;
        }

        :global(.content-html li) {
          margin: 8px 0;
        }

        :global(.content-html a) {
          color: #667eea;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        :global(.content-html a:hover) {
          color: #764ba2;
        }

        :global(.content-html img) {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(.content-html pre) {
          background: #1f2937;
          color: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 24px 0;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        :global(.content-html code) {
          background: #f3f4f6;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #ef4444;
        }

        :global(.content-html pre code) {
          background: none;
          padding: 0;
          color: #f9fafb;
        }

        :global(.content-html blockquote) {
          border-left: 4px solid #667eea;
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: #6b7280;
        }

        .placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .preview-content {
            padding: 20px;
          }

          .content-title {
            font-size: 1.5rem;
          }

          :global(.content-html) {
            font-size: 1rem;
          }
        }
      `}</style>
        </div>
    );
}
