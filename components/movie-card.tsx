import { Doc } from "@/convex/_generated/dataModel";
import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  movie: Doc<"movies">;
};

const MovieCard = ({ movie }: Props) => {
  return (
    <Link key={movie._id} href={`/movie/${movie._id}`} className="group">
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <img
          src={movie.posterUrl || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-white font-medium text-sm truncate">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="text-gray-300 text-sm">
            {movie.avgRating || "N/A"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
