import { cn } from "@/lib/utils";
import type { SkeletonProps } from "@/types/components/ui";

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

import type { SkeletonCardProps } from "@/types/components/ui";

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

import type { SkeletonDraftCardProps } from "@/types/components/ui";

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

import type { DashboardSkeletonProps } from "@/types/components/ui";

function DashboardSkeleton({ showDrafts = true }: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Skeleton */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>

        {/* Main Content Card */}
        <div className="rounded-lg border bg-white shadow-sm">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Card Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border bg-white shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Cards for Archives/Drafts (if showing) */}
        {showDrafts && (
          <div className="mt-8">
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-white shadow-sm"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16 rounded-full" />
                            <Skeleton className="h-6 w-48" />
                          </div>
                          <Skeleton className="h-4 w-20 rounded-full" />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-32" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                          <Skeleton className="h-8 w-28 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonDraftCard, DashboardSkeleton };
