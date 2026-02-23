'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaCode,
  FaHeading
} from 'react-icons/fa';

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const html = editor.getHTML();
      // Trigger auto-save
      console.log('Auto-saving...', html);
    }, 30000);

    return () => clearInterval(interval);
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    // If link is already active, unset it
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt('Enter URL:');
    if (!url) return;

    // Ensure URL has protocol
    const href = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    // If text is selected, apply link to selection
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().setLink({ href }).run();
    } else {
      // No selection - insert the URL as linked text
      editor.chain().focus()
        .insertContent(`<a href="${href}">${url}</a>`)
        .run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        Loading editor...
      </div>
    );
  }

  const characterCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <FaBold />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <FaItalic />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <FaUnderline />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            <FaListUl />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <FaListOl />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={setLink}
            className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Add Link"
          >
            <FaLink />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="toolbar-btn"
            title="Add Image"
          >
            <FaImage />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code Block"
          >
            <FaCode />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-footer">
        <span className="character-count">{characterCount} characters</span>
      </div>

      <style jsx global>{`
        .rich-text-editor {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
        }

        .rich-text-editor .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          flex-wrap: wrap;
        }

        .rich-text-editor .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .rich-text-editor .toolbar-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
        }

        .rich-text-editor .toolbar-btn {
          width: 36px;
          height: 36px;
          border: 1px solid transparent !important;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .rich-text-editor .toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #e5e7eb;
        }

        .rich-text-editor .toolbar-btn.active {
          background: rgba(139, 92, 246, 0.3);
          color: #c4b5fd;
          border: 1px solid rgba(139, 92, 246, 0.4) !important;
        }

        .rich-text-editor .editor-content {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
        }

        .rich-text-editor .ProseMirror {
          padding: 20px;
          outline: none;
          min-height: 300px;
          color: #e5e7eb;
        }

        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #4b5563;
          pointer-events: none;
          float: left;
          height: 0;
        }

        .rich-text-editor .ProseMirror p {
          margin: 0 0 16px 0;
        }

        .rich-text-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 24px 0 16px 0;
          color: #f3f4f6;
        }

        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 20px 0 12px 0;
          color: #f3f4f6;
        }

        .rich-text-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 16px 0 12px 0;
          color: #f3f4f6;
        }

        .rich-text-editor .ProseMirror ul {
          padding-left: 24px;
          margin: 0 0 16px 0;
          list-style-type: disc;
        }

        .rich-text-editor .ProseMirror ol {
          padding-left: 24px;
          margin: 0 0 16px 0;
          list-style-type: decimal;
        }

        .rich-text-editor .ProseMirror li {
          margin: 4px 0;
          display: list-item;
        }

        .rich-text-editor .ProseMirror li p {
          margin: 0;
        }

        .rich-text-editor .ProseMirror a {
          color: #a78bfa;
          text-decoration: underline;
        }

        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }

        .rich-text-editor .ProseMirror pre {
          background: rgba(0, 0, 0, 0.4);
          color: #e5e7eb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .rich-text-editor .ProseMirror code {
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          color: #c4b5fd;
        }

        .rich-text-editor .editor-footer {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
          display: flex;
          justify-content: flex-end;
        }

        .rich-text-editor .character-count {
          font-size: 0.85rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
