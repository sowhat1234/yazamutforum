import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  // Get comments for an idea
  getByIdea: publicProcedure
    .input(z.object({ ideaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: { 
          ideaId: input.ideaId,
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Create new comment
  create: protectedProcedure
    .input(
      z.object({
        ideaId: z.string(),
        content: z.string().min(1),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the idea exists
      const idea = await ctx.db.idea.findUnique({
        where: { id: input.ideaId },
        select: { id: true },
      });

      if (!idea) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found",
        });
      }

      // If replying to a comment, verify it exists
      if (input.parentId) {
        const parentComment = await ctx.db.comment.findUnique({
          where: { id: input.parentId },
          select: { id: true, ideaId: true },
        });

        if (!parentComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
          });
        }

        // Ensure parent comment belongs to the same idea
        if (parentComment.ideaId !== input.ideaId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent comment does not belong to this idea",
          });
        }
      }

      return ctx.db.comment.create({
        data: {
          content: input.content,
          ideaId: input.ideaId,
          authorId: ctx.session.user.id,
          parentId: input.parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }),

  // Update comment
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the comment
      const existingComment = await ctx.db.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existingComment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      return ctx.db.comment.update({
        where: { id: input.id },
        data: { content: input.content },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }),

  // Delete comment
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the comment
      const existingComment = await ctx.db.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existingComment.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      // Delete the comment (cascading will handle replies)
      await ctx.db.comment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get comment by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      return comment;
    }),
});
