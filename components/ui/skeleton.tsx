import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "before:-translate-x-full before:animate-shimmer",
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      <div className="p-6 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        {/* Subtitle lines */}
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      {/* Footer */}
      <div className="bg-gray-50 p-4 rounded-b-lg">
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonDraftCardProps {
  className?: string;
}

function SkeletonDraftCard({ className }: SkeletonDraftCardProps) {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-6 w-2/3" />
        {/* Progress bar */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-2 w-full" />
        </div>
        {/* Last updated */}
        <Skeleton className="h-4 w-1/2" />
        {/* Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

interface DashboardSkeletonProps {
  showDrafts?: boolean;
}

function DashboardSkeleton({ showDrafts = true }: DashboardSkeletonProps) {
  return (
    <div className="p-8 rounded-lg min-h-full">
      {/* Page title */}
      <Skeleton className="h-8 w-32 mb-8" />

      <div className="space-y-6">
        {/* Your Doorcards section */}
        <Skeleton className="h-7 w-40 mb-4" />

        {/* Doorcards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Resume Work section (conditional) */}
        {showDrafts && (
          <>
            <div className="flex justify-between items-center mb-4 mt-8">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>

            {/* Drafts grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonDraftCard />
              <SkeletonDraftCard />
            </div>
          </>
        )}

        {/* Create button */}
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonDraftCard, DashboardSkeleton };
