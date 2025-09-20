import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // Core movie data
  movies: defineTable({
    title: v.string(),
    posterUrl: v.optional(v.string()), // Convex storage URL
    genre: v.string(),
    year: v.string(),
    director: v.string(),
    cast: v.string(),
    description: v.string(),
    trailer: v.optional(v.string()),
    duration: v.optional(v.string()),
    avgRating: v.optional(v.number()),
    rating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
    views: v.optional(v.number()),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("archived"),
    ),
    trending: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    trendingScore: v.optional(v.number()),
    reviews: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_genre", ["genre"])
    .index("by_year", ["year"])
    .index("by_rating", ["avgRating"])
    .index("by_trending", ["trending", "trendingScore"]),

  // Extend the users table
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),

    //custom fields
    favoriteGenres: v.optional(v.array(v.string())),
    preferredRatingRange: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      }),
    ),
    preferredDecades: v.optional(v.array(v.number())),
    favoriteDirectors: v.optional(v.array(v.string())),
    favoriteActors: v.optional(v.array(v.string())),
    personalityProfile: v.optional(
      v.object({
        adventurous: v.number(), // 0-1 scale
        critical: v.number(),
        social: v.number(),
        binge: v.number(),
      }),
    ),
    lastActive: v.optional(v.number()),
  }).index("email", ["email"]),

  // Multi-dimensional ratings
  ratings: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    ratings: v.object({
      acting: v.number(), // 1-5
      plot: v.number(),
      cinematography: v.number(),
      direction: v.number(),
      entertainment: v.number(),
    }),
    overallRating: v.number(), // calculated average
    review: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_movie", ["movieId"])
    .index("by_user_movie", ["userId", "movieId"]),

  // User movie lists
  lists: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    movieIds: v.array(v.id("movies")),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"]),

  // User viewing history
  viewHistory: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    viewedAt: v.number(),
    sessionDuration: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_movie", ["movieId"])
    .index("by_user_date", ["userId", "viewedAt"]),

  // Analytics events
  analyticsEvents: defineTable({
    eventType: v.union(
      v.literal("movie_view"),
      v.literal("rating_submitted"),
      v.literal("search_performed"),
      v.literal("filter_applied"),
      v.literal("list_created"),
    ),
    userId: v.optional(v.id("users")),
    movieId: v.optional(v.id("movies")),
    metadata: v.optional(
      v.object({
        searchQuery: v.optional(v.string()),
        filterType: v.optional(v.string()),
        sessionId: v.optional(v.string()),
      }),
    ),
    timestamp: v.number(),
  })
    .index("by_event_type", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  // Personalized recommendations
  recommendations: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    score: v.number(), // 0-1 confidence score
    reason: v.string(), // "Similar to movies you rated highly", "Popular in Action genre"
    algorithm: v.union(
      v.literal("content_based"),
      v.literal("collaborative"),
      v.literal("trending"),
      v.literal("discovery"),
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_score", ["userId", "score"])
    .index("by_expires", ["expiresAt"]),

  // Community reviews (public reviews separate from personal ratings)
  communityReviews: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    title: v.string(),
    content: v.string(),
    rating: v.number(), // 1-5 overall rating for this review
    spoilerWarning: v.boolean(),
    isEdited: v.boolean(),
    likesCount: v.number(),
    repliesCount: v.number(),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("flagged"),
      v.literal("deleted"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_movie", ["movieId"])
    .index("by_user", ["userId"])
    .index("by_movie_date", ["movieId", "createdAt"])
    .index("by_likes", ["likesCount"])
    .index("by_status", ["status"]),

  // Likes on reviews
  reviewLikes: defineTable({
    userId: v.id("users"),
    reviewId: v.id("communityReviews"),
    createdAt: v.number(),
  })
    .index("by_review", ["reviewId"])
    .index("by_user", ["userId"])
    .index("by_user_review", ["userId", "reviewId"]), // prevent duplicate likes

  // Replies to reviews
  reviewReplies: defineTable({
    userId: v.id("users"),
    reviewId: v.id("communityReviews"),
    parentReplyId: v.optional(v.id("reviewReplies")), // for nested replies
    content: v.string(),
    likesCount: v.number(),
    isEdited: v.boolean(),
    status: v.union(
      v.literal("published"),
      v.literal("flagged"),
      v.literal("deleted"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_review", ["reviewId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentReplyId"])
    .index("by_review_date", ["reviewId", "createdAt"]),

  // Likes on replies
  replyLikes: defineTable({
    userId: v.id("users"),
    replyId: v.id("reviewReplies"),
    createdAt: v.number(),
  })
    .index("by_reply", ["replyId"])
    .index("by_user", ["userId"])
    .index("by_user_reply", ["userId", "replyId"]), // prevent duplicate likes

  // User follows (for community features)
  userFollows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  // Review reports/flags
  reviewReports: defineTable({
    reporterId: v.id("users"),
    reviewId: v.optional(v.id("communityReviews")),
    replyId: v.optional(v.id("reviewReplies")),
    reason: v.union(
      v.literal("spam"),
      v.literal("inappropriate"),
      v.literal("spoilers"),
      v.literal("harassment"),
      v.literal("other"),
    ),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("resolved"),
      v.literal("dismissed"),
    ),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_reporter", ["reporterId"])
    .index("by_review", ["reviewId"])
    .index("by_reply", ["replyId"]),

  // User activity feed
  activityFeed: defineTable({
    userId: v.id("users"),
    actorId: v.id("users"), // who performed the action
    activityType: v.union(
      v.literal("movie_created"),
      v.literal("movie_updated"),
      v.literal("movie_deleted"),
      v.literal("movie_status_changed"),
      v.literal("review_posted"),
      v.literal("review_liked"),
      v.literal("movie_rated"),
      v.literal("user_followed"),
    ),
    targetId: v.string(), // ID of the target (review, reply, movie, etc.)
    targetType: v.union(
      v.literal("review"),
      v.literal("reply"),
      v.literal("movie"),
      v.literal("user"),
    ),

    metadata: v.optional(
      v.object({
        movieTitle: v.optional(v.string()),
        movieId: v.optional(v.id("movies")),
        oldStatus: v.optional(v.string()),
        newStatus: v.optional(v.string()),
        rating: v.optional(v.number()),
        posterUrl: v.optional(v.string()),
      }),
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_user_date", ["userId", "createdAt"]),
});
