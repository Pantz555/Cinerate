import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new list
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const listId = await ctx.db.insert("lists", {
      userId,
      name: args.name,
      description: args.description,
      movieIds: [],
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return listId;
  },
});

// Get all lists for current user
export const getUserLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Enrich lists with movie count and average rating
    const enrichedLists = await Promise.all(
      lists.map(async (list) => {
        const movies = await Promise.all(
          list.movieIds.map((id) => ctx.db.get(id)),
        );

        const validMovies = movies.filter((m) => m !== null);
        const avgRating =
          validMovies.length > 0
            ? validMovies.reduce((sum, m) => sum + (m.avgRating || 0), 0) /
              validMovies.length
            : 0;

        return {
          ...list,
          count: validMovies.length,
          avgRating: Number(avgRating.toFixed(1)),
          movies: validMovies.slice(0, 3), // Preview of first 3 movies
        };
      }),
    );

    return enrichedLists;
  },
});

// Get a single list by ID
export const getById = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const list = await ctx.db.get(args.listId);
    if (!list) {
      return null;
    }

    // Check if user has permission to view
    if (!list.isPublic && list.userId !== userId) {
      throw new Error("Not authorized to view this list");
    }

    // Get all movies in the list
    const movies = await Promise.all(
      list.movieIds.map(async (movieId) => {
        const movie = await ctx.db.get(movieId);
        if (!movie) return null;

        // Get user's rating for this movie if authenticated
        let userRating = null;
        if (userId) {
          userRating = await ctx.db
            .query("ratings")
            .withIndex("by_user_movie", (q) =>
              q.eq("userId", userId).eq("movieId", movieId),
            )
            .first();
        }

        return {
          ...movie,
          userRating: userRating?.overallRating,
        };
      }),
    );

    const validMovies = movies.filter((m) => m !== null);
    const avgRating =
      validMovies.length > 0
        ? validMovies.reduce((sum, m) => sum + (m.avgRating || 0), 0) /
          validMovies.length
        : 0;

    return {
      ...list,
      count: validMovies.length,
      avgRating: Number(avgRating.toFixed(1)),
      movies: validMovies,
    };
  },
});

// Add a movie to a list
export const addMovie = mutation({
  args: {
    listId: v.id("lists"),
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Not authorized to modify this list");
    }

    // Check if movie exists
    const movie = await ctx.db.get(args.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    // Check if movie is already in the list
    if (list.movieIds.includes(args.movieId)) {
      throw new Error("Movie already in list");
    }

    // Add movie to list
    await ctx.db.patch(args.listId, {
      movieIds: [...list.movieIds, args.movieId],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove a movie from a list
export const removeMovie = mutation({
  args: {
    listId: v.id("lists"),
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Not authorized to modify this list");
    }

    // Remove movie from list
    const updatedMovieIds = list.movieIds.filter((id) => id !== args.movieId);

    await ctx.db.patch(args.listId, {
      movieIds: updatedMovieIds,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update list details
export const update = mutation({
  args: {
    listId: v.id("lists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Not authorized to modify this list");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.listId, updates);

    return { success: true };
  },
});

// Delete a list
export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Not authorized to delete this list");
    }

    await ctx.db.delete(args.listId);

    return { success: true };
  },
});

// Check if a movie is in any of user's lists
export const isMovieInLists = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return lists
      .filter((list) => list.movieIds.includes(args.movieId))
      .map((list) => ({
        id: list._id,
        name: list.name,
      }));
  },
});

export const addToWatchlist = mutation({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // 1. Check if the movie is already in any of the user's lists
    const userLists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let targetList = userLists.find((list) =>
      list.movieIds.includes(args.movieId),
    );

    if (targetList) {
      // Movie is already in a list, return its name.
      return { status: "already_added", listName: targetList.name };
    }

    // 2. Movie is not in a list: find/create a 'Watchlist'
    let watchlist: any = userLists.find(
      (list) => list.name.toLowerCase() === "watchlist",
    );

    if (!watchlist) {
      // Create a default 'Watchlist' if it doesn't exist
      const listId = await ctx.db.insert("lists", {
        userId,
        name: "Watchlist",
        description: "My personal watchlist",
        movieIds: [args.movieId], // Add the movie immediately
        isPublic: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Get the newly created list to return its name
      watchlist = await ctx.db.get(listId);
      if (!watchlist) throw new Error("Failed to create list"); // Should not happen
    } else {
      // Watchlist exists, add the movie to it
      await ctx.db.patch(watchlist._id, {
        movieIds: [...watchlist.movieIds, args.movieId],
        updatedAt: Date.now(),
      });
    }

    return { status: "added", listName: watchlist!.name };
  },
});
