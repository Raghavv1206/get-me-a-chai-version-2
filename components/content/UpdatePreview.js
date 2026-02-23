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
          <span className="meta-divider">&bull;</span>
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
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .preview-header {
          padding: 20px;
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .preview-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f3f4f6;
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
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .badge-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #9ca3af;
        }
        .badge-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #a78bfa;
        }
        .content-title {
          font-size: 2rem;
          font-weight: 700;
          color: #f3f4f6;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }
        .content-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .meta-item { font-size: 0.9rem; color: #6b7280; }
        .meta-divider { color: #4b5563; }
        :global(.content-html) { font-size: 1.05rem; line-height: 1.8; color: #d1d5db; }
        :global(.content-html p) { margin: 0 0 20px 0; }
        :global(.content-html h1) { font-size: 2rem; font-weight: 700; margin: 32px 0 16px; color: #f3f4f6; }
        :global(.content-html h2) { font-size: 1.5rem; font-weight: 700; margin: 28px 0 14px; color: #f3f4f6; }
        :global(.content-html h3) { font-size: 1.25rem; font-weight: 700; margin: 24px 0 12px; color: #f3f4f6; }
        :global(.content-html ul), :global(.content-html ol) { padding-left: 28px; margin: 0 0 20px; }
        :global(.content-html li) { margin: 8px 0; }
        :global(.content-html a) { color: #a78bfa; text-decoration: underline; }
        :global(.content-html a:hover) { color: #c4b5fd; }
        :global(.content-html img) { max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0; }
        :global(.content-html pre) { background: rgba(0,0,0,0.4); color: #e5e7eb; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 24px 0; border: 1px solid rgba(255,255,255,0.08); }
        :global(.content-html code) { background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 6px; color: #c4b5fd; }
        :global(.content-html pre code) { background: none; padding: 0; color: #e5e7eb; }
        :global(.content-html blockquote) { border-left: 4px solid #7c3aed; padding-left: 20px; margin: 24px 0; font-style: italic; color: #9ca3af; }
        .placeholder { color: #4b5563; font-style: italic; }
        @media (max-width: 768px) {
          .preview-content { padding: 20px; }
          .content-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
