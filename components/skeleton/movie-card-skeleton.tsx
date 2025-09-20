export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Poster Skeleton */}
      <div className="w-full aspect-[2/3] rounded-md bg-[#292d38] animate-pulse" />

      {/* Title Skeleton */}
      <div className="h-4 w-3/4 rounded bg-[#292d38] animate-pulse" />
    </div>
  );
}
