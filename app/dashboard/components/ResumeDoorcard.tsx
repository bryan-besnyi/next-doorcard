import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Trash2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type React from "react";

import type { ResumeDoorCardProps } from "@/types/components/forms";

export default function ResumeDoorcard({
  draft,
  onDelete,
  isDeleting = false,
}: ResumeDoorCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(draft.id);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card
      className="flex flex-col transition-all duration-200 hover:shadow-lg hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      role="article"
      aria-labelledby={`draft-title-${draft.id}`}
      aria-describedby={`draft-desc-${draft.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="secondary"
            className="text-xs font-medium"
            aria-label="Draft status"
          >
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs font-medium ${getCompletionColor(
              draft.completionPercentage
            )}`}
            aria-label={`${draft.completionPercentage}% complete`}
          >
            {draft.completionPercentage}% Complete
          </Badge>
        </div>

        <CardTitle
          id={`draft-title-${draft.id}`}
          className="text-lg font-semibold text-gray-900 line-clamp-2"
        >
          {draft.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <div id={`draft-desc-${draft.id}`} className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>Last saved: {formatDate(draft.lastUpdated)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="font-semibold text-gray-900">
                {draft.completionPercentage}%
              </span>
            </div>

            <div className="relative">
              <Progress
                value={draft.completionPercentage}
                className="h-2 bg-gray-200"
                aria-label={`Draft completion: ${draft.completionPercentage}%`}
              />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  draft.completionPercentage
                )}`}
                style={{ width: `${draft.completionPercentage}%` }}
              />
            </div>
          </div>

          {draft.completionPercentage < 25 && (
            <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Just getting started</p>
                <p className="text-xs text-amber-700 mt-1">
                  Complete basic info to make progress
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4">
        <div className="w-full flex gap-3">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isDeleting}
            aria-describedby={`resume-desc-${draft.id}`}
          >
            <Link href={`/create-doorcard?draft=${draft.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Resume Work
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete draft: ${draft.name}`}
            aria-describedby={`delete-desc-${draft.id}`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">
              {isDeleting ? "Deleting draft..." : "Delete draft"}
            </span>
          </Button>
        </div>

        {/* Screen reader descriptions */}
        <div className="sr-only">
          <p id={`resume-desc-${draft.id}`}>
            Resume working on {draft.name}, last updated{" "}
            {formatTimeAgo(draft.lastUpdated)}
          </p>
          <p id={`delete-desc-${draft.id}`}>
            Permanently delete this draft. This action cannot be undone.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
