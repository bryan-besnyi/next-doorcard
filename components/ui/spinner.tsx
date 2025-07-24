import { cn } from "@/lib/utils";
import type { SpinnerProps } from "@/types/components/ui";

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-gray-900",
        sizeClasses[size],
        className
      )}
    />
  );
}

import type { LoadingButtonProps } from "@/types/components/ui";

export function LoadingButton({
  isLoading,
  children,
  loadingText = "Loading...",
}: LoadingButtonProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span>{loadingText}</span>
      </div>
    );
  }

  return <>{children}</>;
}
