import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getCommunityReviews = query({
  args: {
    movieId: v.optional(v.id("movies")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db
      .query("communityReviews")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    if (args.movieId) {
      reviewsQuery = ctx.db
        .query("communityReviews")
        .withIndex("by_movie_date", (q) => q.eq("movieId", args.movieId!)) // ! means it's safe
        .filter((q) => q.eq(q.field("status"), "published"));
    } else {
      reviewsQuery = ctx.db
        .query("communityReviews")
        .withIndex("by_status", (q) => q.eq("status", "published"));
    }

    const reviews = await reviewsQuery
      .order("desc")
      .paginate(args.paginationOpts);

    // Get user info for each review
    const reviewsWithUsers = await Promise.all(
      reviews.page.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const movie = await ctx.db.get(review.movieId);

        return {
          ...review,
          user: {
            name: user?.name || "Anonymous",
            image: user?.image,
          },
          movie: {
            title: movie?.title || "Unknown Movie",
            posterUrl: movie?.posterUrl,
          },
        };
      }),
    );

    return {
      ...reviews,
      page: reviewsWithUsers,
      isDone: reviews.isDone,
      continueCursor: reviews.continueCursor,
    };
  },
});

export const likeReview = mutation({
  args: { reviewId: v.id("communityReviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("reviewLikes")
      .withIndex("by_user_review", (q) =>
        q.eq("userId", user._id).eq("reviewId", args.reviewId),
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.reviewId, {
        likesCount: Math.max(0, review.likesCount - 1),
        updatedAt: Date.now(),
      });
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("reviewLikes", {
        userId: user._id,
        reviewId: args.reviewId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.reviewId, {
        likesCount: review.likesCount + 1,
        updatedAt: Date.now(),
      });
      return { liked: true };
    }
  },
});

export const getUserLikes = query({
  args: { reviewIds: v.array(v.id("communityReviews")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []; // Return empty array for unauthenticated users
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }

    const likes = await ctx.db
      .query("reviewLikes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.or(...args.reviewIds.map((id) => q.eq(q.field("reviewId"), id))),
      )
      .collect();

    return likes.map((like) => like.reviewId);
  },
});

export const addReplyToReview = mutation({
  args: {
    reviewId: v.id("communityReviews"),
    content: v.string(),
    parentReplyId: v.optional(v.id("reviewReplies")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized!");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const replyId = await ctx.db.insert("reviewReplies", {
      userId: user._id,
      reviewId: args.reviewId,
      parentReplyId: args.parentReplyId,
      content: args.content,
      likesCount: 0,
      isEdited: false,
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update reply count on the review
    const review = await ctx.db.get(args.reviewId);
    if (review) {
      await ctx.db.patch(args.reviewId, {
        repliesCount: review.repliesCount + 1,
      });
    }

    return replyId;
  },
});

export const getReviewReplies = query({
  args: { reviewId: v.id("communityReviews") },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("reviewReplies")
      .withIndex("by_review_date", (q) => q.eq("reviewId", args.reviewId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

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
