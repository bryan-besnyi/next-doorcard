"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Failed to load data. Please try again.",
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardErrorStateProps {
  doorcardError?: boolean;
  draftError?: boolean;
  onRetryDoorcards?: () => void;
  onRetryDrafts?: () => void;
}

export function DashboardErrorState({
  doorcardError = false,
  draftError = false,
  onRetryDoorcards,
  onRetryDrafts,
}: DashboardErrorStateProps) {
  if (doorcardError && draftError) {
    return (
      <div className="p-8 rounded-lg min-h-full">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        <ErrorState
          title="Failed to load dashboard"
          description="Unable to load your doorcards and drafts. Please check your connection and try again."
          onRetry={() => {
            onRetryDoorcards?.();
            onRetryDrafts?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8 rounded-lg min-h-full">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Your Doorcards</h2>

        {doorcardError ? (
          <ErrorState
            title="Failed to load doorcards"
            description="Unable to load your doorcards. Please try again."
            onRetry={onRetryDoorcards}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Show skeleton cards when drafts error but doorcards load */}
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        )}

        {draftError && (
          <>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h2 className="text-xl font-semibold">Resume Work</h2>
            </div>
            <ErrorState
              title="Failed to load drafts"
              description="Unable to load your draft doorcards. Please try again."
              onRetry={onRetryDrafts}
            />
          </>
        )}
      </div>
    </div>
  );
}
