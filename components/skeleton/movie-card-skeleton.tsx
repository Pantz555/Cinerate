import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Poster Skeleton */}
      <Skeleton className="w-full aspect-[2/3] rounded-md" />

      {/* Title Skeleton */}
      <Skeleton className="h-4 w-3/4 rounded" />
    </div>
  );
}
