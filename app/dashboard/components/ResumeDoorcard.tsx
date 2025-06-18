import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type React from "react"; // Added import for React

interface DraftDoorcard {
  id: string;
  name: string;
  lastUpdated: string;
  completionPercentage: number;
}

interface ResumeDoorCardProps {
  draft: DraftDoorcard;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function ResumeDoorcard({
  draft,
  onDelete,
  isDeleting = false,
}: ResumeDoorCardProps) {
  const formatDate = (dateString: string) => {
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
    onDelete(draft.id);
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-grow p-6">
        <h3 className="text-lg font-medium mb-2">{draft.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {formatDate(draft.lastUpdated)}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion</span>
            <span>{draft.completionPercentage}%</span>
          </div>
          <Progress value={draft.completionPercentage} />
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4">
        <div className="w-full flex gap-2">
          <Button
            asChild
            variant="default"
            className="flex-1"
            disabled={isDeleting}
          >
            <Link href={`/create-doorcard?draft=${draft.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">
              {isDeleting ? "Deleting..." : "Delete draft"}
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
