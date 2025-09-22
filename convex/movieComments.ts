import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getMovieComments = query({
  args: {
    movieId: v.id("movies"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("movieComments")
      .withIndex("by_movie_date", (q) => q.eq("movieId", args.movieId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.eq(q.field("parentCommentId"), undefined), // Only top-level comments
        ),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Get user info for each comment
    const commentsWithUsers = await Promise.all(
      comments.page.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            name: user?.name || "Anonymous",
            image: user?.image,
          },
        };
      }),
    );

    return {
      ...comments,
      page: commentsWithUsers,
    };
  },
});

export const addMovieComment = mutation({
  args: {
    movieId: v.id("movies"),
    content: v.string(),
    parentCommentId: v.optional(v.id("movieComments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to comment");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment is too long (max 1000 characters)");
    }

    // If this is a reply, validate parent comment exists
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      // Update parent comment reply count
      await ctx.db.patch(args.parentCommentId, {
        repliesCount: (parentComment.repliesCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }

    // Create the comment
    const commentId = await ctx.db.insert("movieComments", {
      userId,
      movieId: args.movieId,
      content: args.content.trim(),
      likesCount: 0,
      dislikesCount: 0,
      repliesCount: 0,
      parentCommentId: args.parentCommentId,
      isEdited: false,
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

export const editMovieComment = mutation({
  args: {
    commentId: v.id("movieComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to edit comments");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("You can only edit your own comments");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment is too long (max 1000 characters)");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content.trim(),
      isEdited: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteMovieComment = mutation({
  args: { commentId: v.id("movieComments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to delete comments");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }

    // Update parent comment reply count if this was a reply
    if (comment.parentCommentId) {
      const parentComment = await ctx.db.get(comment.parentCommentId);
      if (parentComment) {
        await ctx.db.patch(comment.parentCommentId, {
          repliesCount: Math.max(0, (parentComment.repliesCount || 0) - 1),
          updatedAt: Date.now(),
        });
      }
    }

    // Delete all reactions to this comment
    const reactions = await ctx.db
      .query("movieCommentReactions")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();

    await Promise.all(reactions.map((reaction) => ctx.db.delete(reaction._id)));

    // Delete replies to this comment
    const replies = await ctx.db
      .query("movieComments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
      .collect();

    await Promise.all(replies.map((reply) => ctx.db.delete(reply._id)));

    // Delete the comment
    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});

export const reactToComment = mutation({
  args: {
    commentId: v.id("movieComments"),
    reactionType: v.union(v.literal("like"), v.literal("dislike")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to react to comments");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user already reacted to this comment
    const existingReaction = await ctx.db
      .query("movieCommentReactions")
      .withIndex("by_user_comment", (q) =>
        q.eq("userId", userId).eq("commentId", args.commentId),
      )
      .first();

    let likesChange = 0;
    let dislikesChange = 0;

    if (existingReaction) {
      if (existingReaction.reactionType === args.reactionType) {
        // Remove the reaction if it's the same type
        await ctx.db.delete(existingReaction._id);

        if (args.reactionType === "like") {
          likesChange = -1;
        } else {
          dislikesChange = -1;
        }
      } else {
        // Change reaction type
        await ctx.db.patch(existingReaction._id, {
          reactionType: args.reactionType,
          createdAt: Date.now(),
        });

        if (args.reactionType === "like") {
          likesChange = 1;
          dislikesChange = -1;
        } else {
          likesChange = -1;
          dislikesChange = 1;
        }
      }
    } else {
      // Add new reaction
      await ctx.db.insert("movieCommentReactions", {
        userId,
        commentId: args.commentId,
        reactionType: args.reactionType,
        createdAt: Date.now(),
      });

      if (args.reactionType === "like") {
        likesChange = 1;
      } else {
        dislikesChange = 1;
      }
    }

    // Update comment counts
    await ctx.db.patch(args.commentId, {
      likesCount: Math.max(0, comment.likesCount + likesChange),
      dislikesCount: Math.max(0, comment.dislikesCount + dislikesChange),
      updatedAt: Date.now(),
    });

    return {
      newLikesCount: Math.max(0, comment.likesCount + likesChange),
      newDislikesCount: Math.max(0, comment.dislikesCount + dislikesChange),
    };
  },
});

export const getUserCommentReactions = query({
  args: { commentIds: v.array(v.id("movieComments")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {}; // Return empty object for unauthenticated users
    }

    if (args.commentIds.length === 0) {
      return {};
    }

    const reactions = await ctx.db
      .query("movieCommentReactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.or(...args.commentIds.map((id) => q.eq(q.field("commentId"), id))),
      )
      .collect();

    const reactionsMap: Record<string, "like" | "dislike"> = {};
    reactions.forEach((reaction) => {
      reactionsMap[reaction.commentId] = reaction.reactionType;
    });

    return reactionsMap;
  },
});

export const getCommentReplies = query({
  args: { parentCommentId: v.id("movieComments") },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("movieComments")
      .withIndex("by_parent", (q) =>
        q.eq("parentCommentId", args.parentCommentId),
      )
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("asc") // Show oldest replies first
      .collect();

    // Get user info for each reply
    const repliesWithUsers = await Promise.all(
      replies.map(async (reply) => {
        const user = await ctx.db.get(reply.userId);
        return {
          ...reply,
          user: {
            name: user?.name || "Anonymous",
            image: user?.image,
          },
        };
      }),
    );

    return repliesWithUsers;
  },
});
