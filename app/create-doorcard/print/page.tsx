"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrintExportDoorcard from "../components/PrintExportDoorcard";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { Loader2 } from "lucide-react";

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
}

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  timeBlocks: TimeBlock[];
}

export default function PrintDoorcardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [doorcard, setDoorcard] = useState<Doorcard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoorcard = async () => {
      const doorcardId = searchParams.get("id");
      const isDraft = searchParams.get("draft") === "true";

      if (!doorcardId) {
        console.error("No doorcard ID provided");
        setError("No doorcard ID provided");
        setIsLoading(false);
        return;
      }

      console.log(
        `Fetching doorcard with ID: ${doorcardId}, isDraft: ${isDraft}`
      );

      try {
        const endpoint = isDraft
          ? `/api/doorcards/draft/${doorcardId}`
          : `/api/doorcards/${doorcardId}`;
        console.log(`Fetching from endpoint: ${endpoint}`);

        const response = await fetch(endpoint);
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch doorcard: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        const doorcardData = isDraft ? data.data : data;
        console.log("Processed doorcard data:", doorcardData);

        setDoorcard(doorcardData);
        setIsLoading(false);

        // Track print preview
        if (doorcardData.id) {
          analytics.trackPrint(doorcardData.id, "preview");
        }
      } catch (error) {
        console.error("Error fetching doorcard:", error);
        setError("Failed to load doorcard for printing");
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doorcard for printing",
        });
      }
    };

    fetchDoorcard();
  }, [searchParams, toast]);

  useEffect(() => {
    if (!isLoading && doorcard) {
      console.log("Doorcard loaded, preparing to print");
      const timer = setTimeout(() => {
        console.log("Triggering print");
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [doorcard, isLoading]);

  useEffect(() => {
    const handleBeforePrint = () => {
      console.log("Before print event triggered");
    };

    const handleAfterPrint = () => {
      console.log("After print event triggered");

      // Track successful print/download
      if (doorcard?.id) {
        analytics.trackPrint(doorcard.id, "download");
      }

      router.push("/dashboard");
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading doorcard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!doorcard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Failed to load doorcard</div>
      </div>
    );
  }

  console.log("Rendering PrintExportDoorcard component inside print-container");
  return (
    <div className="print-container">
      <PrintExportDoorcard data={doorcard} isPrintView={true} />
    </div>
  );
}
