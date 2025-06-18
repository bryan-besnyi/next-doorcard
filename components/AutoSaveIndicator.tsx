"use client";

import { useDoorcardStore } from "@/store/use-doorcard-store";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AutoSaveIndicator() {
  const { isLoading } = useDoorcardStore();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    // Update last saved time when saving completes
    if (!isLoading.savingDraft && lastSaved === null) {
      setLastSaved(new Date());
      setSaveError(false);
    }
  }, [isLoading.savingDraft, lastSaved]);

  if (isLoading.savingDraft) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Spinner size="sm" />
        <span>Saving draft...</span>
      </div>
    );
  }

  if (saveError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={16} />
        <span>Failed to save</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle size={16} />
        <span>
          Saved{" "}
          {lastSaved.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    );
  }

  return null;
}
