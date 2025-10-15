import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Initialize default achievements (run once)
export const initializeDefaultAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const defaultAchievements = [
      // Rating Milestones
      {
        title: "First Steps",
        description: "Rated your first movie",
        icon: "🎬",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 1 },
        rarity: "common" as const,
        points: 10,
      },
      {
        title: "Getting Started",
        description: "Rated 10 movies",
        icon: "⭐",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 10 },
        rarity: "common" as const,
        points: 25,
      },
      {
        title: "Movie Enthusiast",
        description: "Rated 50 movies",
        icon: "🍿",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 50 },
        rarity: "uncommon" as const,
        points: 100,
      },
      {
        title: "Cinema Connoisseur",
        description: "Rated 100 movies",
        icon: "🏆",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 100 },
        rarity: "rare" as const,
        points: 250,
      },
      {
        title: "Movie Master",
        description: "Rated 250 movies",
        icon: "🎭",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 250 },
        rarity: "epic" as const,
        points: 500,
      },
      {
        title: "Legendary Critic",
        description: "Rated 500 movies",
        icon: "👑",
        category: "ratings" as const,
        requirement: { type: "total_ratings" as const, value: 500 },
        rarity: "legendary" as const,
        points: 1000,
      },

      // Activity Achievements
      {
        title: "Daily Viewer",
        description: "Rate movies for 3 consecutive days",
        icon: "📅",
        category: "activity" as const,
        requirement: { type: "consecutive_days" as const, value: 3 },
        rarity: "common" as const,
        points: 25,
      },
      {
        title: "Weekly Warrior",
        description: "Rate movies for 7 consecutive days",
        icon: "🔥",
        category: "activity" as const,
        requirement: { type: "consecutive_days" as const, value: 7 },
        rarity: "uncommon" as const,
        points: 75,
      },
      {
        title: "Monthly Marathon",
        description: "Rate movies for 30 consecutive days",
        icon: "⚡",
        category: "activity" as const,
        requirement: { type: "consecutive_days" as const, value: 30 },
        rarity: "rare" as const,
        points: 300,
      },

      // Quality Achievements
      {
        title: "Harsh Critic",
        description: "Give 10 ratings of 2 stars or below",
        icon: "😤",
        category: "ratings" as const,
        requirement: { type: "low_ratings" as const, value: 10 },
        rarity: "uncommon" as const,
        points: 50,
      },
      {
        title: "Easy to Please",
        description: "Give 25 ratings of 5 stars",
        icon: "😍",
        category: "ratings" as const,
        requirement: { type: "high_ratings" as const, value: 25 },
        rarity: "uncommon" as const,
        points: 75,
      },

      // Exploration Achievements
      {
        title: "Genre Explorer",
        description: "Rate movies in 5 different genres",
        icon: "🗺️",
        category: "exploration" as const,
        requirement: { type: "genre_diversity" as const, value: 5 },
        rarity: "common" as const,
        points: 50,
      },
      {
        title: "Genre Master",
        description: "Rate movies in 10 different genres",
        icon: "🌟",
        category: "exploration" as const,
        requirement: { type: "genre_diversity" as const, value: 10 },
        rarity: "uncommon" as const,
        points: 100,
      },

      // Social Achievements
      {
        title: "First Review",
        description: "Write your first movie review",
        icon: "✍️",
        category: "social" as const,
        requirement: { type: "reviews_written" as const, value: 1 },
        rarity: "common" as const,
        points: 20,
      },
      {
        title: "Prolific Reviewer",
        description: "Write 10 movie reviews",
        icon: "📝",
        category: "social" as const,
        requirement: { type: "reviews_written" as const, value: 10 },
        rarity: "uncommon" as const,
        points: 100,
      },

      // Special Achievements
      {
        title: "Early Bird",
        description: "One of the first 100 users to join",
        icon: "🐦",
        category: "milestone" as const,
        requirement: { type: "early_adopter" as const, value: 100 },
        rarity: "rare" as const,
        points: 200,
      },
    ];

    const insertedAchievements = [];

    for (const achievement of defaultAchievements) {
      // Check if achievement already exists
      const existing = await ctx.db
        .query("achievements")
        .filter((q) => q.eq(q.field("title"), achievement.title))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("achievements", {
          ...achievement,
          isActive: true,
          createdAt: Date.now(),
        });
        insertedAchievements.push(id);
      }
    }

    return {
      message: `Initialized ${insertedAchievements.length} new achievements`,
      insertedIds: insertedAchievements,
    };
  },
});

// Get all achievements
export const getAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get achievements by category
export const getAchievementsByCategory = query({
  args: {
    category: v.union(
      v.literal("ratings"),
      v.literal("activity"),
      v.literal("social"),
      v.literal("exploration"),
      v.literal("milestone"),
    ),
  },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get achievements by rarity
export const getAchievementsByRarity = query({
  args: {
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary"),
    ),
  },
  handler: async (ctx, { rarity }) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_rarity", (q) => q.eq("rarity", rarity))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update streaks for all users (called by cron)
export const updateAllUserStreaks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const userId = user._id;
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const today = Math.floor(now / oneDayMs);
      const lastRatingDay = user.lastRatingDate
        ? Math.floor(user.lastRatingDate / oneDayMs)
        : 0;

      let newStreak = user.currentStreak || 0;

      if (lastRatingDay === today - 1) {
        newStreak += 1;
      } else if (lastRatingDay < today - 1) {
        newStreak = 0; // streak broken if user didn’t rate yesterday
      }

      await ctx.db.patch(userId, {
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak || 0, newStreak),
      });
    }
  },
});

// Recompute achievements for all users
export const recomputeAllAchievements = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const achievements = await ctx.db.query("achievements").collect();

    for (const user of users) {
      const userId = user._id;
      const ratings = await ctx.db
        .query("ratings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const totalRatings = ratings.length;
      const highRatings = ratings.filter((r) => r.overallRating >= 5).length;
      const lowRatings = ratings.filter((r) => r.overallRating <= 2).length;

      // Fetch user's unlocked achievements
      const unlocked = await ctx.db
        .query("userAchievements")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const unlockedIds = unlocked.map((ua) => ua.achievementId);

      // Loop through all achievements
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement._id)) continue; // skip if already unlocked

        let meetsRequirement = false;

        switch (achievement.requirement.type) {
          case "total_ratings":
            meetsRequirement = totalRatings >= achievement.requirement.value;
            break;
          case "high_ratings":
            meetsRequirement = highRatings >= achievement.requirement.value;
            break;
          case "low_ratings":
            meetsRequirement = lowRatings >= achievement.requirement.value;
            break;
          default:
            continue;
        }

        if (meetsRequirement) {
          // ✅ Add record to userAchievements
          await ctx.db.insert("userAchievements", {
            userId,
            achievementId: achievement._id,
            earnedAt: Date.now(),
          });

          // ✅ Trigger notification helper
          await ctx.runMutation(
            api.notificationHelpers.notifyAchievementUnlocked,
            {
              userId,
              achievementId: achievement._id,
            },
          );

          console.log(
            `User ${userId} unlocked achievement: ${achievement.title}`,
          );
        }
      }
    }
  },
});
