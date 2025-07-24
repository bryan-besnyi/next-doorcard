"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COLLEGES, type College } from "@/types/doorcard";
import { Search, Clock, MapPin, Calendar } from "lucide-react";

// Custom hook for debounced values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
// College display names for badges
const COLLEGE_BADGE_NAMES: Record<College, string> = {
  CSM: "CSM",
  SKYLINE: "Skyline",
  CANADA: "Cañada",
};

import type { PublicDoorcard, DoorcardResponse } from "@/types/pages/public";

export default function Home() {
  const router = useRouter();
  const [doorcards, setDoorcards] = useState<PublicDoorcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<College | "ALL">("ALL");

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchDoorcards();
  }, []);

  const fetchDoorcards = async () => {
    try {
      const response = await fetch("/api/doorcards/public");
      const data: DoorcardResponse = await response.json();
      setDoorcards(data.doorcards);
    } catch (error) {
      console.error("Error fetching doorcards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered doorcards using debounced search
  const filteredDoorcards = useMemo(() => {
    let filtered = doorcards;

    // Filter by campus
    if (selectedCampus !== "ALL") {
      filtered = filtered.filter((dc) => dc.college === selectedCampus);
    }

    // Filter by search term (using debounced value)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (dc) =>
          dc.name.toLowerCase().includes(term) ||
          dc.doorcardName.toLowerCase().includes(term) ||
          dc.user.name?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [doorcards, selectedCampus, debouncedSearchTerm]);

  const handleDoorcardClick = (doorcard: PublicDoorcard) => {
    const username =
      doorcard.user?.username ||
      doorcard.user?.name?.toLowerCase().replace(/\s+/g, "-") ||
      "user";
    router.push(`/view/${username}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mt-5 text-gray-900">
          Faculty Door Cards
        </h1>
        <p className="text-gray-600 mt-1">
          San Mateo County Community College District
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Faculty Door Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by faculty name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:w-48">
              <Tabs
                value={selectedCampus}
                onValueChange={(value) =>
                  setSelectedCampus(value as College | "ALL")
                }
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="SKYLINE">SKY</TabsTrigger>
                  <TabsTrigger value="CSM">CSM</TabsTrigger>
                  <TabsTrigger value="CANADA">CAN</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Faculty Directory</span>
            <Badge variant="secondary">
              {filteredDoorcards.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading door cards...</p>
            </div>
          ) : filteredDoorcards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No door cards found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDoorcards.map((doorcard) => (
                <Card
                  key={doorcard.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDoorcardClick(doorcard)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {doorcard.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {doorcard.doorcardName}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{doorcard.officeNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {doorcard.term} {doorcard.year}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{doorcard.appointmentCount} time blocks</span>
                        </div>
                        {doorcard.college && (
                          <Badge variant="outline">
                            {(doorcard.college &&
                              COLLEGE_BADGE_NAMES[
                                doorcard.college as College
                              ]) ||
                              doorcard.college}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
