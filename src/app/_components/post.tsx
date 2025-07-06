"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setTitle("");
      setContent("");
    },
  });

  // Get first category for demo purposes (we'll need proper category selection later)
  const categories = api.category.getAll.useQuery();
  const firstCategoryId = categories.data?.[0]?.id;

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.title}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (firstCategoryId) {
            createPost.mutate({ 
              title, 
              content,
              categoryId: firstCategoryId 
            });
          }
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded bg-white/10 px-4 py-2 text-white"
          rows={3}
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending || !firstCategoryId}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
