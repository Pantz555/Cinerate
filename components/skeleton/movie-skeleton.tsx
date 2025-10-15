import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MovieSkeleton = () => (
  <div className="">
    <Skeleton className="rounded-lg aspect-[2/3]" />
    <Skeleton className="h-4 rounded mt-3" />
    <div className="flex justify-between mt-2">
      <Skeleton className="h-3 rounded w-12" />
      <Skeleton className="h-3 rounded w-8" />
    </div>
  </div>
);
export default MovieSkeleton;
