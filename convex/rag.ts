import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536, // Needs to match your embedding model
  filterNames: ["movieId"],
});

export const addMovieEmbeddings = action({
  args: {
    title: v.string(),
    content: v.string(),
    cast: v.string(),
    genre: v.string(),
    year: v.string(),
    movieId: v.id("movies"),
    posterUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const text = `${args.title} ${args.content} ${args.cast} ${args.genre} ${args.year}
    `;

    await rag.add(ctx, {
      namespace: "global",
      text,
      filterValues: [
        {
          name: "movieId",
          value: args.movieId,
        },
      ],
      metadata: {
        title: args.title,
        movieId: args.movieId,
        posterUrl: args.posterUrl || null,
      },
    });
  },
});

export const removeMovieEmbeddings = action({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    // Search for embeddings with the specific movieId
    const searchResults = await rag.search(ctx, {
      namespace: "global",
      query: "", // Empty query to get all results
      limit: 100, // Adjust limit as needed
    });

    // Filter results to find entries with matching movieId
    const entriesToDelete = searchResults.entries.filter(
      (entry) => entry.metadata?.movieId === args.movieId,
    );

    // Delete each matching entry
    for (const entry of entriesToDelete) {
      await rag.delete(ctx, { entryId: entry.entryId });
    }

    return { deletedCount: entriesToDelete.length };
  },
});

export const searchEmbedMovie = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const { results, text, entries } = await rag.search(ctx, {
      namespace: "global",
      query: args.query,
      limit: 5,
      vectorScoreThreshold: 0.2, // Only return results with a score >= 0.5
    });
    console.log("results", results);
    console.log("entries", entries);
    const movieIds = entries.map((entry: any) => entry.metadata.movieId);

    return { results, text, entries };
  },
});

export const searchFilterMovie = action({
  args: {
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const results = await rag.search(ctx, {
      namespace: "global",
      query: "",
      filters: [{ name: "movieId", value: args.movieId }],
      limit: 10,
    });

    return results;
  },
});
