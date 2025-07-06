"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";

import { api } from "~/trpc/react";
import { IdeaCard } from "./idea-card";
import { Modal } from "./modal";
import { IdeaForm } from "./idea-form";

interface IdeaFeedProps {
  currentUserId?: string;
}

export function IdeaFeed({ currentUserId }: IdeaFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showTeamOnly, setShowTeamOnly] = useState(false);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);

  const {
    data: ideasData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.idea.getAll.useInfiniteQuery(
    {
      limit: 10,
      search: searchQuery || undefined,
      category: (selectedCategory as "SAAS" | "MOBILE_APP" | "WEB_APP" | "HARDWARE" | "SERVICE" | "OTHER") || undefined,
      wantsTeam: showTeamOnly || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const ideas = ideasData?.pages.flatMap((page) => page.ideas) ?? [];

  const categories = [
    { value: "", label: "All Categories" },
    { value: "SAAS", label: "SaaS" },
    { value: "MOBILE_APP", label: "Mobile App" },
    { value: "WEB_APP", label: "Web App" },
    { value: "HARDWARE", label: "Hardware" },
    { value: "SERVICE", label: "Service" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Idea Feed</h1>
            <p className="text-gray-600 mt-2">
              Discover innovative ideas and find your next project to build
            </p>
          </div>
          
          {currentUserId && (
            <button 
              onClick={() => setIsIdeaFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Idea
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search ideas, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTeamOnly}
                  onChange={(e) => setShowTeamOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Seeking team only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : ideas.length > 0 ? (
          <>
            {ideas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                currentUserId={currentUserId}
              />
            ))}
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center pt-6">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More Ideas"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory || showTeamOnly
                ? "Try adjusting your filters to see more ideas."
                : "Be the first to share your innovative idea with the community!"}
            </p>
            {currentUserId && (
              <button 
                onClick={() => setIsIdeaFormOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post the First Idea
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Idea Form Modal */}
      <Modal 
        isOpen={isIdeaFormOpen} 
        onClose={() => setIsIdeaFormOpen(false)}
      >
        <IdeaForm 
          onClose={() => setIsIdeaFormOpen(false)}
          onSuccess={() => setIsIdeaFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
