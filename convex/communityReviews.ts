import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { api } from "./_generated/api";

export const getCommunityReviews = query({
  args: {
    movieId: v.optional(v.id("movies")),
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

    // Get user info and movie info for each review
    const reviewsWithUserAndMovie = await Promise.all(
      reviews.page.map(async (review) => {
        const [user, movie] = await Promise.all([
          ctx.db.get(review.userId),
          ctx.db.get(review.movieId),
        ]);

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
      page: reviewsWithUserAndMovie,
    };
  },
});

export const likeReview = mutation({
  args: { reviewId: v.id("communityReviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to like reviews");
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
        q.eq("userId", userId).eq("reviewId", args.reviewId),
      )
      .first();

    if (existingLike) {
      // Unlike - remove the like and decrement counter
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.reviewId, {
        likesCount: Math.max(0, review.likesCount - 1),
        updatedAt: Date.now(),
      });
      return { liked: false, newCount: Math.max(0, review.likesCount - 1) };
    } else {
      // Like - add the like and increment counter
      await ctx.db.insert("reviewLikes", {
        userId,
        reviewId: args.reviewId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.reviewId, {
        likesCount: review.likesCount + 1,
        updatedAt: Date.now(),
      });

      //send notification
      await ctx.runMutation(api.notificationHelpers.notifyReviewLiked, {
        likerId: userId,
        reviewId: args.reviewId,
      });

      return { liked: true, newCount: review.likesCount + 1 };
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

    if (args.reviewIds.length === 0) {
      return [];
    }

    const likes = await ctx.db
      .query("reviewLikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
      throw new Error("You must be logged in to reply to reviews");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Reply content cannot be empty");
    }

    if (args.content.length > 1000) {
      throw new Error("Reply is too long (max 1000 characters)");
    }

    // Create the reply
    const replyId = await ctx.db.insert("reviewReplies", {
      userId,
      reviewId: args.reviewId,
      parentReplyId: args.parentReplyId,
      content: args.content.trim(),
      likesCount: 0,
      isEdited: false,
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update reply count on the review
    await ctx.db.patch(args.reviewId, {
      repliesCount: review.repliesCount + 1,
      updatedAt: Date.now(),
    });

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

// New function to get replies for multiple reviews at once
export const getMultipleReviewReplies = query({
  args: { reviewIds: v.array(v.id("communityReviews")) },
  handler: async (ctx, args) => {
    if (args.reviewIds.length === 0) {
      return {};
    }

    const allReplies = await ctx.db
      .query("reviewReplies")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.or(...args.reviewIds.map((id) => q.eq(q.field("reviewId"), id))),
        ),
      )
      .order("asc")
      .collect();

    // Get user info for all replies
    const repliesWithUsers = await Promise.all(
      allReplies.map(async (reply) => {
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

    // Group replies by reviewId
    const repliesByReview: Record<string, typeof repliesWithUsers> = {};
    repliesWithUsers.forEach((reply) => {
      const reviewId = reply.reviewId;
      if (!repliesByReview[reviewId]) {
        repliesByReview[reviewId] = [];
      }
      repliesByReview[reviewId].push(reply);
    });

    return repliesByReview;
  },
});

// Function to get trending/hot movies for the sidebar
export const getHotMovies = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const hotMovies = await ctx.db
      .query("movies")
      .withIndex("by_trending", (q) => q.eq("trending", true))
      .order("desc") // Most trending first
      .take(limit);

    return hotMovies;
  },
});

// Function to get recent activity (recently rated movies)
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    // Get recent community reviews with high ratings
    const recentReviews = await ctx.db
      .query("communityReviews")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    // Get movie details for each review
    const activityWithMovies = await Promise.all(
      recentReviews.map(async (review) => {
        const movie = await ctx.db.get(review.movieId);
        return {
          movieId: review.movieId,
          title: movie?.title || "Unknown Movie",
          posterUrl: movie?.posterUrl,
          rating: review.rating,
          reviewedAt: review.createdAt,
        };
      }),
    );

    return activityWithMovies;
  },
});

// Function to create a new community review
export const createCommunityReview = mutation({
  args: {
    movieId: v.id("movies"),
    title: v.string(),
    content: v.string(),
    rating: v.number(),
    spoilerWarning: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to create reviews");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    // Validate input
    if (!args.title.trim()) {
      throw new Error("Review title is required");
    }
    if (!args.content.trim()) {
      throw new Error("Review content is required");
    }
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this movie
    const existingReview = await ctx.db
      .query("communityReviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this movie");
    }

    // Create the review
    const reviewId = await ctx.db.insert("communityReviews", {
      userId,
      movieId: args.movieId,
      title: args.title.trim(),
      content: args.content.trim(),
      rating: args.rating,
      spoilerWarning: args.spoilerWarning || false,
      isEdited: false,
      likesCount: 0,
      repliesCount: 0,
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

   
        await ctx.runMutation(api.notificationHelpers.notifyNewReview, {
          movieId: args.movieId,
          reviewerId: user._id,
          reviewId: reviewId,
        });
    

    return reviewId;
  },
});

// Function to delete a review (only by the author)
export const deleteReview = mutation({
  args: { reviewId: v.id("communityReviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to delete reviews");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    // Soft delete - change status to deleted instead of actually deleting
    await ctx.db.patch(args.reviewId, {
      status: "deleted",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Function to edit a review (only by the author)
export const editReview = mutation({
  args: {
    reviewId: v.id("communityReviews"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    rating: v.optional(v.number()),
    spoilerWarning: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to edit reviews");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("You can only edit your own reviews");
    }

    // Prepare update object
    const updateData: any = {
      isEdited: true,
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Review title cannot be empty");
      }
      updateData.title = args.title.trim();
    }

    if (args.content !== undefined) {
      if (!args.content.trim()) {
        throw new Error("Review content cannot be empty");
      }
      updateData.content = args.content.trim();
    }

    if (args.rating !== undefined) {
      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      updateData.rating = args.rating;
    }

    if (args.spoilerWarning !== undefined) {
      updateData.spoilerWarning = args.spoilerWarning;
    }

    await ctx.db.patch(args.reviewId, updateData);

    return { success: true };
  },
});
