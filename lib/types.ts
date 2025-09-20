// Type for a single movie in the structured array
export type StructuredMovie = {
  movieId: string;
  title: string;
  posterUrl: string;
  score: number; // formatted score, e.g., 0.24
};

// Type for the entire array of structured movies
export type StructuredMovies = StructuredMovie[];
