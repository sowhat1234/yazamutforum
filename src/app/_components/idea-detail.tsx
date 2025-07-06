"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Users,
  Tag,
  Calendar,
  User,
  Mail,
  ExternalLink,
  Send
} from "lucide-react";

import { api } from "~/trpc/react";

interface IdeaDetailProps {
  ideaId: string;
  currentUserId?: string;
}

export function IdeaDetail({ ideaId, currentUserId }: IdeaDetailProps) {
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const utils = api.useUtils();

  const { data: idea, isLoading } = api.idea.getById.useQuery({ id: ideaId });
  const { data: comments } = api.comment.getByIdea.useQuery({ ideaId });

  const voteMutation = api.idea.vote.useMutation({
    onSuccess: () => {
      void utils.idea.getById.invalidate({ id: ideaId });
    },
  });

  const interestMutation = api.idea.showInterest.useMutation({
    onSuccess: () => {
      setIsInterested(true);
      setInterestMessage("");
      void utils.idea.getById.invalidate({ id: ideaId });
    },
  });

  const removeInterestMutation = api.idea.removeInterest.useMutation({
    onSuccess: () => {
      setIsInterested(false);
      void utils.idea.getById.invalidate({ id: ideaId });
    },
  });

  const createCommentMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      void utils.comment.getByIdea.invalidate({ ideaId });
    },
  });

  const createReplyMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setReplyText("");
      setReplyingTo(null);
      void utils.comment.getByIdea.invalidate({ ideaId });
    },
  });

  const handleVote = (type: "UP" | "DOWN") => {
    if (!currentUserId) return;
    
    voteMutation.mutate({
      ideaId,
      type,
    });
    
    setUserVote(userVote === type ? null : type);
  };

  const handleInterest = () => {
    if (!currentUserId) return;
    
    if (isInterested) {
      removeInterestMutation.mutate({ ideaId });
    } else {
      interestMutation.mutate({ 
        ideaId, 
        message: interestMessage.trim() || undefined 
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newComment.trim()) return;

    createCommentMutation.mutate({
      ideaId,
      content: newComment.trim(),
    });
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!currentUserId || !replyText.trim()) return;

    createReplyMutation.mutate({
      ideaId,
      content: replyText.trim(),
      parentId,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      SAAS: "bg-blue-500",
      MOBILE_APP: "bg-green-500", 
      WEB_APP: "bg-yellow-500",
      HARDWARE: "bg-red-500",
      SERVICE: "bg-purple-500",
      OTHER: "bg-gray-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 animate-pulse">
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Idea not found</h1>
          <p className="text-gray-600 mb-6">The idea you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Back to Ideas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Main Idea Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {idea.author.image ? (
                  <img 
                    src={idea.author.image} 
                    alt={idea.author.name ?? "User"} 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 text-lg">
                    {idea.author.name ?? idea.author.username ?? "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(idea.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(idea.category)}`}>
                {idea.category.replace('_', ' ')}
              </span>
              {idea.wantsTeam && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Seeking Team
                </span>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{idea.title}</h1>
          
          {/* Tags */}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 border-b border-gray-200">
          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: idea.description }}
          />
        </div>

        {/* Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Voting */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote("UP")}
                  disabled={!currentUserId || voteMutation.isPending}
                  className={`p-2 rounded-lg transition-colors ${
                    userVote === "UP" 
                      ? "text-green-600 bg-green-50" 
                      : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className="text-lg font-bold text-gray-900 min-w-[3rem] text-center">
                  {idea.upvotes - idea.downvotes}
                </span>
                <button
                  onClick={() => handleVote("DOWN")}
                  disabled={!currentUserId || voteMutation.isPending}
                  className={`p-2 rounded-lg transition-colors ${
                    userVote === "DOWN" 
                      ? "text-red-600 bg-red-50" 
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              {/* Comments */}
              <a 
                href="#comments"
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{comments?.length ?? 0} comments</span>
              </a>

              {/* Interests */}
              {idea.wantsTeam && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{idea.interests.length} interested</span>
                </div>
              )}
            </div>

            {/* Interest Button */}
            {idea.wantsTeam && currentUserId && idea.author.id !== currentUserId && (
              <button
                onClick={handleInterest}
                disabled={interestMutation.isPending || removeInterestMutation.isPending}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isInterested
                    ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                <Heart className={`w-5 h-5 inline mr-2 ${isInterested ? "fill-current" : ""}`} />
                {isInterested ? "Interested" : "I want to build this"}
              </button>
            )}
          </div>

          {/* Interest Message Input */}
          {idea.wantsTeam && currentUserId && idea.author.id !== currentUserId && !isInterested && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="block text-sm font-medium text-orange-800 mb-2">
                Add a message (optional)
              </label>
              <textarea
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                placeholder="Tell the author why you're interested and what you can contribute..."
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-orange-600 mt-1">{interestMessage.length}/500 characters</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Formation Section */}
      {idea.wantsTeam && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-600" />
              Team Formation
            </h2>
          </div>
          
          <div className="p-6">
            {/* Skills Needed */}
            {idea.neededSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {idea.neededSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Skills */}
            {idea.author.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Author&apos;s Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {idea.author.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interested Users */}
            {idea.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Interested Team Members ({idea.interests.length})
                </h3>
                <div className="space-y-4">
                  {idea.interests.map((interest) => (
                    <div key={interest.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      {interest.user.image ? (
                        <img 
                          src={interest.user.image} 
                          alt={interest.user.name ?? "User"} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {interest.user.name ?? interest.user.username ?? "Anonymous"}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(interest.createdAt)}
                          </span>
                        </div>
                        {interest.user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {interest.user.skills.map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {interest.message && (
                          <p className="text-gray-700 text-sm italic">&quot;{interest.message}&quot;</p>
                        )}
                        {currentUserId === idea.author.id && (
                          <div className="mt-2 flex gap-2">
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                              <Mail className="w-4 h-4 inline mr-1" />
                              Contact
                            </button>
                            <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                              <ExternalLink className="w-4 h-4 inline mr-1" />
                              View Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {idea.interests.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-600">Be the first to show interest in building this idea!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div id="comments" className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Comments ({comments?.length ?? 0})
          </h2>
        </div>

        {/* Comment Form */}
        {currentUserId && (
          <form onSubmit={handleCommentSubmit} className="p-6 border-b border-gray-200">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this idea..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="p-6">
          {comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  {/* Main Comment */}
                  <div className="flex gap-4">
                    {comment.author.image ? (
                      <img 
                        src={comment.author.image} 
                        alt={comment.author.name ?? "User"} 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author.name ?? comment.author.username ?? "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      {currentUserId && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form 
                      onSubmit={(e) => handleReplySubmit(e, comment.id)}
                      className="ml-14 bg-gray-50 rounded-lg p-4"
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!replyText.trim() || createReplyMutation.isPending}
                          className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {createReplyMutation.isPending ? "Posting..." : "Reply"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-14 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          {reply.author.image ? (
                            <img 
                              src={reply.author.image} 
                              alt={reply.author.name ?? "User"} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {reply.author.name ?? reply.author.username ?? "Anonymous"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-600">Be the first to share your thoughts on this idea!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
