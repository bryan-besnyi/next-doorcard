"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PrintableDoorcard from "@/components/PrintableDoorcard";
import {
  Clock,
  MapPin,
  Calendar,
  Printer,
  Share2,
  ExternalLink,
  User,
  Building,
} from "lucide-react";
import { analytics } from "@/lib/analytics";

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
}

export default function PublicDoorcardView() {
  const params = useParams();
  const slug = params.slug as string;

  const [doorcard, setDoorcard] = useState<Doorcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchDoorcard = async () => {
      try {
        const response = await fetch(`/api/doorcards/public/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Doorcard not found");
          } else if (response.status === 403) {
            setError("This doorcard is not publicly accessible");
          } else {
            setError("Failed to load doorcard");
          }
          return;
        }

        const data = await response.json();
        setDoorcard(data);

        // Track view
        analytics.trackView(data.id, {
          slug,
          source: "public_url",
          userAgent: navigator.userAgent,
        });
      } catch (err) {
        console.error("Error fetching doorcard:", err);
        setError("Failed to load doorcard");
      } finally {
        setLoading(false);
      }
    };

    fetchDoorcard();
  }, [slug]);

  const handlePrint = () => {
    if (!doorcard) return;

    analytics.trackPrint(doorcard.id, "preview");
    setShowPrintView(true);
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
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        analytics.trackShare(doorcard.id, "clipboard");
        alert("Link copied to clipboard!");
      } catch (err) {
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
              The doorcard you're looking for might have been moved, deleted, or
              made private.
            </p>
            <Button asChild>
              <a href="/">Browse Doorcards</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showPrintView) {
    return (
      <PrintableDoorcard
        doorcard={doorcard}
        onBack={() => setShowPrintView(false)}
        onPrint={() => analytics.trackPrint(doorcard.id, "download")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {doorcard.doorcardName}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {doorcard.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {doorcard.officeNumber}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {doorcard.term} {doorcard.year}
                </div>
                {doorcard.college && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {doorcard.college}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                onClick={handlePrint}
                size="sm"
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Current Status
                  </h3>
                  <Badge
                    variant={doorcard.isActive ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {doorcard.isActive ? "Currently Active" : "Inactive"}
                  </Badge>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Office Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {doorcard.appointments.length > 0 ? (
                <div className="space-y-4">
                  {doorcard.appointments
                    .sort((a, b) => {
                      const dayOrder = [
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY",
                        "SUNDAY",
                      ];
                      return (
                        dayOrder.indexOf(a.dayOfWeek) -
                        dayOrder.indexOf(b.dayOfWeek)
                      );
                    })
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-gray-900">
                              {formatDayOfWeek(appointment.dayOfWeek)}
                            </span>
                            <span className="text-gray-600">
                              {formatTime(appointment.startTime)} -{" "}
                              {formatTime(appointment.endTime)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">
                              {appointment.name}
                            </span>
                            {appointment.location && (
                              <span className="ml-2">
                                • {appointment.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {formatCategory(appointment.category)}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No scheduled appointments or office hours.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
