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
  User
} from "lucide-react";

import { api } from "~/trpc/react";

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    wantsTeam: boolean;
    neededSkills: string[];
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
      skills: string[];
    };
    _count: {
      comments: number;
      votes: number;
      interests: number;
    };
  };
  currentUserId?: string;
}

export function IdeaCard({ idea, currentUserId }: IdeaCardProps) {
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null);
  const [isInterested, setIsInterested] = useState(false);

  const utils = api.useUtils();
  
  const voteMutation = api.idea.vote.useMutation({
    onSuccess: () => {
      void utils.idea.getAll.invalidate();
    },
  });

  const interestMutation = api.idea.showInterest.useMutation({
    onSuccess: () => {
      setIsInterested(true);
      void utils.idea.getAll.invalidate();
    },
  });

  const removeInterestMutation = api.idea.removeInterest.useMutation({
    onSuccess: () => {
      setIsInterested(false);
      void utils.idea.getAll.invalidate();
    },
  });

  const handleVote = (type: "UP" | "DOWN") => {
    if (!currentUserId) return;
    
    voteMutation.mutate({
      ideaId: idea.id,
      type,
    });
    
    setUserVote(userVote === type ? null : type);
  };

  const handleInterest = () => {
    if (!currentUserId) return;
    
    if (isInterested) {
      removeInterestMutation.mutate({ ideaId: idea.id });
    } else {
      interestMutation.mutate({ ideaId: idea.id });
    }
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
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-lg shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {idea.author.image ? (
              <img 
                src={idea.author.image} 
                alt={idea.author.name ?? "User"} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {idea.author.name ?? idea.author.username ?? "Anonymous User"}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(idea.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(idea.category)}`}>
            {idea.category.replace('_', ' ')}
          </span>
          {idea.wantsTeam && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              Seeking Team
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/ideas/${idea.id}`} className="block group">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {idea.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 mb-4">
          {idea.description.length > 200 
            ? `${idea.description.substring(0, 200)}...` 
            : idea.description
          }
        </p>
      </Link>

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
              +{idea.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Skills Needed */}
      {idea.wantsTeam && idea.neededSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Skills needed:</p>
          <div className="flex flex-wrap gap-1">
            {idea.neededSkills.slice(0, 4).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {idea.neededSkills.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                +{idea.neededSkills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Voting */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote("UP")}
              disabled={!currentUserId || voteMutation.isPending}
              className={`p-1 rounded transition-colors ${
                userVote === "UP" 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-500 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900">
              {idea.upvotes - idea.downvotes}
            </span>
            <button
              onClick={() => handleVote("DOWN")}
              disabled={!currentUserId || voteMutation.isPending}
              className={`p-1 rounded transition-colors ${
                userVote === "DOWN" 
                  ? "text-red-600 bg-red-50" 
                  : "text-gray-500 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Comments */}
          <Link 
            href={`/ideas/${idea.id}#comments`}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{idea._count.comments}</span>
          </Link>

          {/* Interests */}
          {idea.wantsTeam && (
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{idea._count.interests} interested</span>
            </div>
          )}
        </div>

        {/* Interest Button */}
        {idea.wantsTeam && currentUserId && idea.author.id !== currentUserId && (
          <button
            onClick={handleInterest}
            disabled={interestMutation.isPending || removeInterestMutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-md ${
              isInterested
                ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            <Heart className={`w-4 h-4 inline mr-1 ${isInterested ? "fill-current" : ""}`} />
            {isInterested ? "Interested" : "I want to build this"}
          </button>
        )}
      </div>
    </div>
  );
}
