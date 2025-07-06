import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const ideaRouter = createTRPCRouter({
  // Get all ideas with pagination and filtering
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        category: z.enum(["SAAS", "MOBILE_APP", "WEB_APP", "HARDWARE", "SERVICE", "OTHER"]).optional(),
        wantsTeam: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.IdeaWhereInput = {};
      
      if (input.category) {
        where.category = input.category;
      }
      
      if (input.wantsTeam !== undefined) {
        where.wantsTeam = input.wantsTeam;
      }
      
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { tags: { has: input.search } },
        ];
      }

      const ideas = await ctx.db.idea.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
              interests: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (ideas.length > input.limit) {
        const nextItem = ideas.pop();
        nextCursor = nextItem?.id;
      }

      return {
        ideas,
        nextCursor,
      };
    }),

  // Get single idea by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const idea = await ctx.db.idea.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
              bio: true,
            },
          },
          comments: {
            where: { parentId: null }, // Only top-level comments
            orderBy: { createdAt: "asc" },
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
              },
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
          interests: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  skills: true,
                  bio: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!idea) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found",
        });
      }

      return idea;
    }),

  // Create new idea
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1),
        category: z.enum(["SAAS", "MOBILE_APP", "WEB_APP", "HARDWARE", "SERVICE", "OTHER"]),
        tags: z.array(z.string()).default([]),
        wantsTeam: z.boolean().default(false),
        neededSkills: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.idea.create({
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          tags: input.tags,
          wantsTeam: input.wantsTeam,
          neededSkills: input.neededSkills,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
              interests: true,
            },
          },
        },
      });
    }),

  // Update existing idea
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        category: z.enum(["SAAS", "MOBILE_APP", "WEB_APP", "HARDWARE", "SERVICE", "OTHER"]).optional(),
        tags: z.array(z.string()).optional(),
        wantsTeam: z.boolean().optional(),
        neededSkills: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Check if user owns the idea
      const existingIdea = await ctx.db.idea.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!existingIdea) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found",
        });
      }

      if (existingIdea.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own ideas",
        });
      }

      return ctx.db.idea.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
            },
          },
        },
      });
    }),

  // Vote on idea
  vote: protectedProcedure
    .input(
      z.object({
        ideaId: z.string(),
        type: z.enum(["UP", "DOWN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.vote.findUnique({
        where: {
          userId_ideaId: {
            ideaId: input.ideaId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.type === input.type) {
          // Remove vote if same type
          await ctx.db.vote.delete({
            where: { id: existingVote.id },
          });
          
          // Update vote counts
          const updateData = input.type === "UP" 
            ? { upvotes: { decrement: 1 } }
            : { downvotes: { decrement: 1 } };
            
          await ctx.db.idea.update({
            where: { id: input.ideaId },
            data: updateData,
          });
          
          return { action: "removed" };
        } else {
          // Update vote type
          await ctx.db.vote.update({
            where: { id: existingVote.id },
            data: { type: input.type },
          });
          
          // Update vote counts (decrement old, increment new)
          const oldType = existingVote.type;
          const newType = input.type;
          
          const updateData = {
            ...(oldType === "UP" ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } }),
            ...(newType === "UP" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } }),
          };
          
          await ctx.db.idea.update({
            where: { id: input.ideaId },
            data: updateData,
          });
          
          return { action: "updated" };
        }
      } else {
        // Create new vote
        await ctx.db.vote.create({
          data: {
            type: input.type,
            ideaId: input.ideaId,
            userId: ctx.session.user.id,
          },
        });
        
        // Update vote counts
        const updateData = input.type === "UP" 
          ? { upvotes: { increment: 1 } }
          : { downvotes: { increment: 1 } };
          
        await ctx.db.idea.update({
          where: { id: input.ideaId },
          data: updateData,
        });
        
        return { action: "created" };
      }
    }),

  // Show interest in an idea for team formation
  showInterest: protectedProcedure
    .input(
      z.object({
        ideaId: z.string(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already showed interest
      const existingInterest = await ctx.db.interest.findUnique({
        where: {
          userId_ideaId: {
            ideaId: input.ideaId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingInterest) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already shown interest in this idea",
        });
      }

      // Check if user is the author (can't show interest in own idea)
      const idea = await ctx.db.idea.findUnique({
        where: { id: input.ideaId },
        select: { authorId: true },
      });

      if (idea?.authorId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot show interest in your own idea",
        });
      }

      return ctx.db.interest.create({
        data: {
          ideaId: input.ideaId,
          userId: ctx.session.user.id,
          message: input.message,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
              bio: true,
            },
          },
        },
      });
    }),

  // Remove interest in an idea
  removeInterest: protectedProcedure
    .input(z.object({ ideaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingInterest = await ctx.db.interest.findUnique({
        where: {
          userId_ideaId: {
            ideaId: input.ideaId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!existingInterest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interest not found",
        });
      }

      await ctx.db.interest.delete({
        where: { id: existingInterest.id },
      });

      return { success: true };
    }),

  // Get interested users for an idea
  getInterestedUsers: publicProcedure
    .input(z.object({ ideaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.interest.findMany({
        where: { ideaId: input.ideaId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              skills: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get user's own ideas
  getMyIdeas: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.idea.findMany({
        where: { authorId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              comments: true,
              votes: true,
              interests: true,
            },
          },
        },
      });
    }),

  // Get ideas user has shown interest in
  getMyInterests: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.interest.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          idea: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  votes: true,
                  interests: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
