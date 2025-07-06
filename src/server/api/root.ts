import { postRouter } from "~/server/api/routers/post";
import { categoryRouter } from "~/server/api/routers/category";
import { ideaRouter } from "~/server/api/routers/idea";
import { commentRouter } from "~/server/api/routers/comment";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Legacy forum routers
  post: postRouter,
  category: categoryRouter,
  
  // MVP idea platform routers
  idea: ideaRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
