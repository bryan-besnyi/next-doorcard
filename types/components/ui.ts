// UI Component Types

// Skeleton Types
export interface SkeletonProps {
  className?: string;
}

export interface SkeletonCardProps {
  className?: string;
}

export interface SkeletonDraftCardProps {
  className?: string;
}

export interface DashboardSkeletonProps {
  showDrafts?: boolean;
}

// Spinner Types
export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

// Error State Types
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export interface DashboardErrorStateProps {
  error?: Error;
  onRetry?: () => void;
}

// Error Boundary Types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Badge Types
export interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  children: React.ReactNode;
}

// Button Types
export interface ButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

// Toast Types
export interface ToastProps {
  className?: string;
  children: React.ReactNode;
}

export interface ToastActionElement {
  altText?: string;
  action?: React.ReactNode;
}
