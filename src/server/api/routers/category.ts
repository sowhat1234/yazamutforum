import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 50);
}

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }),

  // Get category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Create category (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#3b82f6"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create categories",
        });
      }

      const baseSlug = generateSlug(input.name);
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await ctx.db.category.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return ctx.db.category.create({
        data: {
          name: input.name,
          description: input.description,
          slug,
          color: input.color,
        },
      });
    }),

  // Update category (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update categories",
        });
      }

      const { id, ...updateData } = input;
      
      // If name is being updated, generate new slug
      if (updateData.name) {
        const baseSlug = generateSlug(updateData.name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug (excluding current category)
        while (await ctx.db.category.findFirst({ 
          where: { 
            slug,
            NOT: { id }
          } 
        })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        (updateData as any).slug = slug;
      }

      return ctx.db.category.update({
        where: { id },
        data: updateData,
      });
    }),
});
