import React from "react";

const MovieSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-700 rounded-lg aspect-[2/3]" />
    <div className="h-4 bg-gray-700 rounded mt-3" />
    <div className="flex justify-between mt-2">
      <div className="h-3 bg-gray-700 rounded w-12" />
      <div className="h-3 bg-gray-700 rounded w-8" />
    </div>
  </div>
);
export default MovieSkeleton;
