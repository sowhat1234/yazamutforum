import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 50);
}

export const postRouter = createTRPCRouter({
  // Get all posts with pagination
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        categoryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.categoryId ? { categoryId: input.categoryId } : undefined,
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          _count: {
            select: {
              replies: true,
              votes: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  // Get single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          category: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
              votes: true,
              children: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      role: true,
                    },
                  },
                  votes: true,
                },
              },
            },
          },
          votes: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Increment view count
      await ctx.db.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    }),

  // Create new post
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const baseSlug = generateSlug(input.title);
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await ctx.db.post.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          slug,
          categoryId: input.categoryId,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
        },
      });
    }),

  // Vote on post
  vote: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        type: z.enum(["UP", "DOWN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.postVote.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.type === input.type) {
          // Remove vote if same type
          await ctx.db.postVote.delete({
            where: { id: existingVote.id },
          });
          return { action: "removed" };
        } else {
          // Update vote type
          await ctx.db.postVote.update({
            where: { id: existingVote.id },
            data: { type: input.type },
          });
          return { action: "updated" };
        }
      } else {
        // Create new vote
        await ctx.db.postVote.create({
          data: {
            type: input.type,
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        });
        return { action: "created" };
      }
    }),

  // Get latest post for current user
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      where: { authorId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return post;
  }),

  // Legacy endpoints for backward compatibility
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "Welcome to YazamutForum! You can now see this secret message!";
  }),
});
