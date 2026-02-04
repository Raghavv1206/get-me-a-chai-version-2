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
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
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
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return <div>Loading editor...</div>;
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

            <style jsx>{`
        .rich-text-editor {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #d1d5db;
        }

        .toolbar-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .toolbar-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .toolbar-btn.active {
          background: #667eea;
          color: white;
        }

        :global(.editor-content) {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
        }

        :global(.ProseMirror) {
          padding: 20px;
          outline: none;
          min-height: 300px;
        }

        :global(.ProseMirror p) {
          margin: 0 0 16px 0;
        }

        :global(.ProseMirror h1) {
          font-size: 2rem;
          font-weight: 700;
          margin: 24px 0 16px 0;
        }

        :global(.ProseMirror h2) {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 20px 0 12px 0;
        }

        :global(.ProseMirror h3) {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 16px 0 12px 0;
        }

        :global(.ProseMirror ul),
        :global(.ProseMirror ol) {
          padding-left: 24px;
          margin: 0 0 16px 0;
        }

        :global(.ProseMirror li) {
          margin: 4px 0;
        }

        :global(.ProseMirror a) {
          color: #667eea;
          text-decoration: underline;
        }

        :global(.ProseMirror img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }

        :global(.ProseMirror pre) {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
        }

        :global(.ProseMirror code) {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .editor-footer {
          padding: 8px 12px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .character-count {
          font-size: 0.85rem;
          color: #9ca3af;
        }
      `}</style>
        </div>
    );
}
