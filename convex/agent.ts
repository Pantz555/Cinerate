// file: cineRateAgent.ts

import { openai } from "@ai-sdk/openai";
import { api, components } from "./_generated/api";
import { Agent, createTool } from "@convex-dev/agent";
import { z } from "zod";
import { action, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Tool: searchMovies
 * When user asks "suggest me some movies", "recommend thrillers", etc.
 */
const searchMovies = createTool({
  description: "Search for movies by keyword, genre, or recommendation context",
  args: z.object({
    query: z.string(),
  }),
  handler: async ({}) => {
    // Example dummy response - replace with real movie DB API call
    return [
      { id: "tt1375666", title: "Inception (2010)", url: `/movie/tt1375666` },
      {
        id: "tt0816692",
        title: "Interstellar (2014)",
        url: `/movie/tt0816692`,
      },
    ];
  },
});

/**
 * Tool: getMovieDetails
 * When user asks "give me Joker movie" or "movies by Christopher Nolan".
 */
const searchMovieWithQuery = createTool({
  description: "Search the movies for the given query",
  args: z.object({
    query: z.string(),
  }),
  handler: async (ctx, args) => {
    const { entries }: any = await ctx.runAction(api.rag.searchEmbedMovie, {
      query: args.query,
    });

    if (!entries || entries.length === 0) {
      return { message: `No movies found for "${args.query}"` };
    }
  },
});

/**
 * CineRate Bot Agent
 */
export const cineRateAgent = new Agent(components.agent, {
  name: "CineRate Bot",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: `
You are CineRate Bot, the official assistant for the CineRate website.
Your role is to help users rate, review, and discover movies with the community.
- Always stay on-topic about movies.
- Use tools for discovery and details.
- Provide movie links in the format: /movie/{movieId}.
- Encourage users to leave ratings and reviews.

don't give json response
`,
  tools: { searchMovies, searchMovieWithQuery },
});

/**
 * Create a conversation thread
 */
export const createThread = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("UnAuthorized");

    const { threadId } = await cineRateAgent.createThread(ctx, { userId });
    return threadId;
  },
});

/**
 * Send a message to CineRate Bot
 */
export const sendMessageToAgent = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { thread } = await cineRateAgent.continueThread(ctx, {
      threadId: args.threadId,
    });

    const result = await thread.streamText(
      { prompt: args.prompt },
      { saveStreamDeltas: true },
    );

    await result.consumeStream();
  },
});
