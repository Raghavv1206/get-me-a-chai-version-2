'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { FaHeart, FaRegHeart, FaReply, FaFlag, FaTrash, FaThumbtack, FaClock, FaFire, FaSortAmountDown, FaTimes } from 'react-icons/fa';
import { toast } from '@/lib/apiToast';

export default function DiscussionTab({ campaignId, creatorId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [likedComments, setLikedComments] = useState(new Set());
  const commentFormRef = useRef(null);

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
      toast.error('Please login to comment');
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
        cancelReply();
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!session) {
      toast.error('Please login to like comments');
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
        toast.success('Comment reported successfully');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment._id);
    setReplyToComment(comment);
    // Scroll to comment form
    commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus on textarea after scroll
    setTimeout(() => {
      const textarea = commentFormRef.current?.querySelector('textarea');
      textarea?.focus();
    }, 500);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyToComment(null);
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
      <div className={`flex gap-4 p-5 rounded-2xl transition-all ${comment.pinned
        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30'
        : isReply
          ? 'bg-white/5 border border-white/10 ml-12'
          : 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
        }`}>
        {comment.pinned && (
          <div className="absolute -top-3 left-12 flex items-center gap-1.5 px-3 py-1 bg-yellow-500 rounded-full text-xs font-semibold text-yellow-900">
            <FaThumbtack />
            Pinned by creator
          </div>
        )}

        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
          <Image
            src={comment.user?.profilepic || '/images/default-profilepic.svg'}
            alt={comment.user?.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-white flex items-center gap-2">
              {comment.user?.name}
              {isCreator && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md text-xs">
                  Creator
                </span>
              )}
            </span>
            <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Text */}
          <div className="text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${likedComments.has(comment._id)
                ? 'text-red-400 bg-red-500/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              onClick={() => handleLikeComment(comment._id)}
            >
              {likedComments.has(comment._id) ? <FaHeart /> : <FaRegHeart />}
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && session && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                onClick={() => handleReply(comment)}
              >
                <FaReply /> Reply
              </button>
            )}

            {canModerate && !comment.pinned && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                onClick={() => handlePinComment(comment._id)}
              >
                <FaThumbtack /> Pin
              </button>
            )}

            {(isOwner || canModerate) && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                onClick={() => handleDeleteComment(comment._id)}
              >
                <FaTrash /> Delete
              </button>
            )}

            {!isOwner && session && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                onClick={() => handleReportComment(comment._id)}
              >
                <FaFlag /> Report
              </button>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
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
    <div className="space-y-6">
      {/* Add Comment Form */}
      <div ref={commentFormRef} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {replyTo ? 'Reply to Comment' : 'Join the Discussion'}
        </h3>

        {/* Reply Indicator */}
        {replyToComment && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-purple-300">Replying to</span>
                <span className="text-sm font-semibold text-white">{replyToComment.user?.name}</span>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{replyToComment.content}</p>
            </div>
            <button
              onClick={cancelReply}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              title="Cancel reply"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}

        {session ? (
          <form onSubmit={handleSubmitComment} className="flex gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
              <Image
                src={session.user?.image || '/images/default-profilepic.svg'}
                alt={session.user?.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>

            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                rows="3"
                maxLength="1000"
              />

              <div className="flex items-center justify-end gap-3 mt-3">
                {replyTo && (
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel Reply
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newComment.trim()}
                >
                  {replyTo ? 'Post Reply' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-xl">
            <p className="text-gray-400 mb-4">Please login to join the discussion</p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              onClick={() => window.location.href = '/login'}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Sort Options - Modern Design */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Label */}
          <div className="flex items-center gap-2">
            <FaSortAmountDown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Sort Comments</span>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === 'newest'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <FaClock className="w-3.5 h-3.5" />
              <span>Newest</span>
            </button>

            <button
              onClick={() => setSortBy('oldest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === 'oldest'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <FaClock className="w-3.5 h-3.5 rotate-180" />
              <span>Oldest</span>
            </button>

            <button
              onClick={() => setSortBy('top')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === 'top'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <FaFire className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>

          {/* Comment Count */}
          <div className="text-sm text-gray-400">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No comments yet</h3>
          <p className="text-gray-400">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
