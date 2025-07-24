"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UnifiedDoorcard from "@/components/UnifiedDoorcard";
import {
  Clock,
  MapPin,
  Calendar,
  Printer,
  Share2,
  ExternalLink,
  User,
  Building,
  ArrowLeft,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useSession } from "next-auth/react";

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  isActive: boolean;
  user: {
    name?: string;
    college?: string;
  };
  appointments: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    category: string;
    location?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function PublicDoorcardView() {
  const params = useParams();
  const slugArray = params.slug as string[];
  const { data: session } = useSession();

  const [doorcard, setDoorcard] = useState<Doorcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSpecificTerm, setIsSpecificTerm] = useState(false);

  useEffect(() => {
    if (!slugArray || slugArray.length === 0) return;

    const fetchDoorcard = async () => {
      try {
        // Check if we should use authenticated endpoint
        const urlParams = new URLSearchParams(window.location.search);
        const useAuth = urlParams.get("auth") === "true";
        setIsAdminView(useAuth);

        // Parse the slug array to determine if it's username or username/term
        const username = slugArray[0];
        const termSlug = slugArray[1]; // undefined if just username

        setIsSpecificTerm(!!termSlug);

        let endpoint;
        if (termSlug) {
          // Specific term: /view/username/term-slug
          endpoint = useAuth
            ? `/api/doorcards/view/${username}/${termSlug}`
            : `/api/doorcards/public/${username}/${termSlug}`;
        } else {
          // Current active: /view/username
          endpoint = useAuth
            ? `/api/doorcards/view/${username}/current`
            : `/api/doorcards/public/${username}/current`;
        }

        const response = await fetch(endpoint);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Doorcard not found");
          } else if (response.status === 403) {
            setError("This doorcard is not publicly accessible");
          } else if (response.status === 401) {
            setError("Authentication required to view this doorcard");
          } else {
            setError("Failed to load doorcard");
          }
          return;
        }

        const data = await response.json();
        console.log("Fetched doorcard data:", data);
        console.log("Appointments:", data.appointments);
        console.log("Time blocks:", data.timeBlocks);
        console.log("Appointments length:", data.appointments?.length);
        console.log("Time blocks length:", data.timeBlocks?.length);

        setDoorcard(data);

        // Track view
        analytics.trackView(data.id, {
          slug: slugArray.join("/"),
          source: useAuth ? "admin_view" : "public_url",
          userAgent: navigator.userAgent,
          isSpecificTerm: !!termSlug,
        });
      } catch (error) {
        console.error("Error fetching doorcard:", error);
        setError("Failed to load doorcard");
      } finally {
        setLoading(false);
      }
    };

    fetchDoorcard();
  }, [slugArray]);

  const handlePrint = () => {
    if (!doorcard) return;

    analytics.trackPrint(doorcard.id, "preview");

    // Store original title
    const originalTitle = document.title;

    // Set a clean title for printing
    document.title = doorcard.doorcardName || "Faculty Doorcard";

    // Print
    window.print();

    // Restore original title
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleShare = async () => {
    if (!doorcard) return;

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${doorcard.doorcardName} - Office Hours`,
          text: `View ${doorcard.name}'s office hours and schedule`,
          url: url,
        });
        analytics.trackShare(doorcard.id, "native_share");
      } catch (error) {
        // User cancelled share
        console.log("Share cancelled:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        analytics.trackShare(doorcard.id, "clipboard");
        alert("Link copied to clipboard!");
      } catch {
        analytics.trackShare(doorcard.id, "manual");
        prompt("Copy this link:", url);
      }
    }
  };

  const formatDayOfWeek = (day: string) => {
    const days = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };
    return days[day as keyof typeof days] || day;
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const printTriggeredRef = useRef(false);
  useEffect(() => {
    if (showPrintView && !printTriggeredRef.current) {
      printTriggeredRef.current = true;
      window.print();
      setShowPrintView(false);
      setTimeout(() => {
        printTriggeredRef.current = false;
      }, 1000);
    }
  }, [showPrintView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doorcard...</p>
        </div>
      </div>
    );
  }

  if (error || !doorcard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <ExternalLink className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Doorcard Not Found"}
            </h1>
            <p className="text-gray-600 mb-6">
              The doorcard you&apos;re looking for might have been moved,
              deleted, or made private.
            </p>
            <Button asChild>
              <Link href="/">Browse Doorcards</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showPrintView) {
    return (
      <UnifiedDoorcard
        mode="public"
        data={doorcard}
        onBack={() => setShowPrintView(false)}
        onPrint={() => analytics.trackPrint(doorcard.id, "download")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 print:border-b-0">
        <div className="max-w-4xl mx-auto px-4 py-6 print:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Main Title and Metadata */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
                  {doorcard.doorcardName || "Faculty Doorcard"}
                </h1>
                {isAdminView && (
                  <Badge variant="outline" className="text-xs">
                    Admin View
                  </Badge>
                )}
                {isSpecificTerm && (
                  <Badge variant="outline" className="text-xs">
                    {doorcard.term} {doorcard.year}
                  </Badge>
                )}
                {doorcard.isActive ? (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
                {doorcard.isPublic ? (
                  <Badge variant="default" className="text-xs">
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 print:text-xs">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{doorcard.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Office {doorcard.officeNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {doorcard.term} {doorcard.year}
                  </span>
                </div>
                {doorcard.college && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{doorcard.college}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Hidden in print */}
            <div className="flex items-center gap-2 print:hidden">
              {session && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full relative">
        {/* Schedule - Full Width Table */}
        {doorcard.appointments.length > 0 ||
        (doorcard as any).timeBlocks?.length > 0 ? (
          <div className="w-full">
            {/* Table View */}
            <UnifiedDoorcard
              mode="public"
              data={doorcard}
              showControls={false}
              onPrint={() => {
                analytics.trackPrint(doorcard.id, "download");
                window.print();
              }}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No scheduled appointments or office hours.
              </h3>
              <p className="text-gray-500">
                This doorcard doesn&apos;t have any scheduled time blocks yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
