import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { vStreamArgs } from "@convex-dev/agent";
import { cineRateAgent } from "./agent";

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await cineRateAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    const streams = await cineRateAgent.syncStreams(ctx, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return {
      ...paginated,
      streams,
    };
  },
});
