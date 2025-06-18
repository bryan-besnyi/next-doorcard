"use client";

import ErrorBoundary from "@/components/ErrorBoundary";

export default function CreateDoorcardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to monitoring service in production
        console.error("Doorcard creation error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
