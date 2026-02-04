'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaReply, FaFlag, FaTrash, FaThumbtack } from 'react-icons/fa';

export default function DiscussionTab({ campaignId, creatorId }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [likedComments, setLikedComments] = useState(new Set());

    useEffect(() => {
        fetchComments();
    }, [campaignId, sortBy]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/campaigns/${campaignId}/comments?sort=${sortBy}`);
            const data = await response.json();

            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!session) {
            alert('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    parentComment: replyTo
                })
            });

            if (response.ok) {
                setNewComment('');
                setReplyTo(null);
                fetchComments();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleLikeComment = async (commentId) => {
        if (!session) {
            alert('Please login to like comments');
            return;
        }

        try {
            const response = await fetch(`/api/campaigns/comments/${commentId}/like`, {
                method: 'POST'
            });

            if (response.ok) {
                setLikedComments(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(commentId)) {
                        newSet.delete(commentId);
                    } else {
                        newSet.add(commentId);
                    }
                    return newSet;
                });

                setComments(prev => updateCommentLikes(prev, commentId));
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const updateCommentLikes = (comments, commentId) => {
        return comments.map(comment => {
            if (comment._id === commentId) {
                return {
                    ...comment,
                    likes: likedComments.has(commentId) ? comment.likes - 1 : comment.likes + 1
                };
            }
            if (comment.replies) {
                return {
                    ...comment,
                    replies: updateCommentLikes(comment.replies, commentId)
                };
            }
            return comment;
        });
    };

    const handlePinComment = async (commentId) => {
        try {
            const response = await fetch(`/api/campaigns/comments/${commentId}/pin`, {
                method: 'POST'
            });

            if (response.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error('Error pinning comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/campaigns/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReportComment = async (commentId) => {
        if (!confirm('Report this comment as inappropriate?')) return;

        try {
            const response = await fetch(`/api/campaigns/comments/${commentId}/report`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Comment reported successfully');
            }
        } catch (error) {
            console.error('Error reporting comment:', error);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffTime = Math.abs(now - commentDate);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return commentDate.toLocaleDateString('en-IN');
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isCreator = comment.user?._id === creatorId;
        const isOwner = session?.user?.id === comment.user?._id;
        const canModerate = session?.user?.id === creatorId || session?.user?.role === 'admin';

        return (
            <div className={`comment-item ${isReply ? 'reply' : ''} ${comment.pinned ? 'pinned' : ''}`}>
                {comment.pinned && (
                    <div className="pinned-badge">
                        <FaThumbtack /> Pinned by creator
                    </div>
                )}

                <div className="comment-avatar">
                    <Image
                        src={comment.user?.profilepic || '/images/default-profilepic.jpg'}
                        alt={comment.user?.name}
                        fill
                        className="avatar-image"
                        sizes="40px"
                    />
                </div>

                <div className="comment-content-wrapper">
                    <div className="comment-header">
                        <span className="comment-author">
                            {comment.user?.name}
                            {isCreator && <span className="creator-badge">Creator</span>}
                        </span>
                        <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>

                    <div className="comment-text">
                        {comment.content}
                    </div>

                    <div className="comment-actions">
                        <button
                            className={`action-btn ${likedComments.has(comment._id) ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(comment._id)}
                        >
                            {likedComments.has(comment._id) ? <FaHeart /> : <FaRegHeart />}
                            {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>

                        {!isReply && session && (
                            <button
                                className="action-btn"
                                onClick={() => setReplyTo(comment._id)}
                            >
                                <FaReply /> Reply
                            </button>
                        )}

                        {canModerate && !comment.pinned && (
                            <button
                                className="action-btn"
                                onClick={() => handlePinComment(comment._id)}
                            >
                                <FaThumbtack /> Pin
                            </button>
                        )}

                        {(isOwner || canModerate) && (
                            <button
                                className="action-btn danger"
                                onClick={() => handleDeleteComment(comment._id)}
                            >
                                <FaTrash /> Delete
                            </button>
                        )}

                        {!isOwner && session && (
                            <button
                                className="action-btn"
                                onClick={() => handleReportComment(comment._id)}
                            >
                                <FaFlag /> Report
                            </button>
                        )}
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="replies-list">
                            {comment.replies.map(reply => (
                                <CommentItem key={reply._id} comment={reply} isReply={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="discussion-tab">
            {/* Add Comment Form */}
            <div className="add-comment-section">
                <h3 className="section-title">
                    {replyTo ? 'Reply to Comment' : 'Join the Discussion'}
                </h3>

                {session ? (
                    <form onSubmit={handleSubmitComment} className="comment-form">
                        <div className="form-avatar">
                            <Image
                                src={session.user?.image || '/images/default-profilepic.jpg'}
                                alt={session.user?.name}
                                fill
                                className="avatar-image"
                                sizes="40px"
                            />
                        </div>

                        <div className="form-input-wrapper">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                                className="comment-input"
                                rows="3"
                                maxLength="1000"
                            />

                            <div className="form-actions">
                                {replyTo && (
                                    <button
                                        type="button"
                                        onClick={() => setReplyTo(null)}
                                        className="cancel-btn"
                                    >
                                        Cancel Reply
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={!newComment.trim()}
                                >
                                    {replyTo ? 'Post Reply' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="login-prompt">
                        <p>Please login to join the discussion</p>
                        <button className="login-btn" onClick={() => window.location.href = '/login'}>
                            Login
                        </button>
                    </div>
                )}
            </div>

            {/* Sort Options */}
            <div className="sort-section">
                <label>Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="top">Most Liked</option>
                </select>
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading comments...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>No comments yet</h3>
                    <p>Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="comments-list">
                    {comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))}
                </div>
            )}

            <style jsx>{`
        .discussion-tab {
          max-width: 800px;
          margin: 0 auto;
        }

        .add-comment-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
        }

        .comment-form {
          display: flex;
          gap: 16px;
        }

        .form-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #f3f4f6;
        }

        .avatar-image {
          object-fit: cover;
        }

        .form-input-wrapper {
          flex: 1;
        }

        .comment-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .comment-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .submit-btn,
        .cancel-btn,
        .login-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .cancel-btn:hover {
          background: #f9fafb;
        }

        .login-prompt {
          text-align: center;
          padding: 30px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .login-prompt p {
          color: #6b7280;
          margin-bottom: 16px;
        }

        .login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .sort-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .sort-section label {
          font-weight: 600;
          color: #374151;
        }

        .sort-select {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .sort-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .loading-container,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #6b7280;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comment-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .comment-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .comment-item.pinned {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
        }

        .comment-item.reply {
          margin-left: 56px;
          background: #f9fafb;
        }

        .pinned-badge {
          position: absolute;
          top: -10px;
          left: 56px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #fbbf24;
          color: #78350f;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .comment-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #f3f4f6;
        }

        .comment-content-wrapper {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .comment-author {
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .creator-badge {
          padding: 2px 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .comment-time {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .comment-text {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }

        .comment-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-btn.liked {
          color: #ef4444;
        }

        .action-btn.danger {
          color: #ef4444;
        }

        .action-btn.danger:hover {
          background: #fef2f2;
        }

        .replies-list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .add-comment-section {
            padding: 20px;
          }

          .comment-form {
            flex-direction: column;
          }

          .comment-item.reply {
            margin-left: 20px;
          }

          .comment-actions {
            gap: 8px;
          }

          .action-btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
        }
      `}</style>
        </div>
    );
}
