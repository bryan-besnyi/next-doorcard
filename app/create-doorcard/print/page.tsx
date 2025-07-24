"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnifiedDoorcard from "@/components/UnifiedDoorcard";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  category: string;
  location?: string;
}

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  category?: string;
}

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term?: string;
  year?: string;
  college?: string;
  isActive?: boolean;
  timeBlocks?: TimeBlock[];
  appointments?: Appointment[];
}

function PrintDoorcardContent() {
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
        console.log("Time blocks:", doorcardData.timeBlocks);
        console.log("Appointments:", doorcardData.appointments);

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
  }, [router, doorcard?.id]);

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

  // Convert uppercase day names to lowercase for UnifiedDoorcard
  const convertTimeBlocks = (blocks: TimeBlock[]) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };

    return blocks.map((block) => ({
      ...block,
      day: dayMap[block.day] || block.day,
      location: block.location ?? undefined, // Convert null to undefined
    }));
  };

  // Convert appointments to timeBlocks if needed
  const convertAppointmentsToTimeBlocks = (
    appointments: Appointment[]
  ): TimeBlock[] => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };

    return appointments.map((apt) => ({
      id: apt.id,
      day: dayMap[apt.dayOfWeek] || apt.dayOfWeek,
      startTime: apt.startTime,
      endTime: apt.endTime,
      activity: apt.name,
      location: apt.location ?? undefined,
      category: apt.category,
    }));
  };

  // Prepare the data for UnifiedDoorcard
  const preparedData = {
    ...doorcard,
    timeBlocks: doorcard.timeBlocks
      ? convertTimeBlocks(doorcard.timeBlocks)
      : doorcard.appointments
      ? convertAppointmentsToTimeBlocks(doorcard.appointments)
      : [],
  };

  console.log("Original doorcard:", doorcard);
  console.log("Prepared data for UnifiedDoorcard:", preparedData);
  console.log("Final timeBlocks:", preparedData.timeBlocks);

  console.log("Rendering UnifiedDoorcard component in print mode");
  return (
    <>
      <style jsx global>{`
        @media print {
          /* Hide everything except our print content */
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Hide any remaining navigation elements */
          nav,
          header,
          footer,
          .navbar,
          .footer,
          .bg-gray-800,
          button,
          .btn {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
      <div className="print-container">
        <UnifiedDoorcard
          mode="print"
          data={preparedData}
          showControls={false}
          onPrint={() => analytics.trackPrint(doorcard.id, "download")}
        />
      </div>
    </>
  );
}

export default function PrintDoorcardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="sr-only">Loading...</span>
        </div>
      }
    >
      <PrintDoorcardContent />
    </Suspense>
  );
}
