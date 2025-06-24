"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  FileText,
  Clock,
  BarChart3,
  Settings,
  User,
  LogOut,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Archive,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeDoorcard from "./components/ResumeDoorcard";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { DashboardErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { COLLEGES } from "@/types/doorcard";

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college?: string;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timeBlocks?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }>;
  appointments?: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }>;
}

interface DraftDoorcard {
  id: string;
  name: string;
  lastUpdated: string;
  completionPercentage: number;
}

interface CompletionData {
  name?: string;
  doorcardName?: string;
  officeNumber?: string;
  term?: string;
  year?: string;
  timeBlocks?: {
    day: string;
    startTime: string;
    endTime: string;
    activity: string;
  }[];
  hasViewedPreview?: boolean;
  hasViewedPrint?: boolean;
  [key: string]: unknown;
}

interface LoadingState {
  doorcards: boolean;
  drafts: boolean;
}

interface ErrorState {
  doorcards: boolean;
  drafts: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doorcards, setDoorcards] = useState<Doorcard[]>([]);
  const [draftDoorcards, setDraftDoorcards] = useState<DraftDoorcard[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    doorcards: true,
    drafts: true,
  });
  const [errors, setErrors] = useState<ErrorState>({
    doorcards: false,
    drafts: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [deletingDrafts, setDeletingDrafts] = useState<Set<string>>(new Set());
  const [deletingAllDrafts, setDeletingAllDrafts] = useState(false);
  const [realMetrics, setRealMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchDrafts = async () => {
    setLoading((prev) => ({ ...prev, drafts: true }));
    setErrors((prev) => ({ ...prev, drafts: false }));

    try {
      const response = await fetch("/api/doorcards/draft");
      if (!response.ok) {
        throw new Error(`Failed to fetch drafts: ${response.statusText}`);
      }
      const data = await response.json();
      setDraftDoorcards(
        data.map(
          (draft: {
            id: string;
            data: { doorcardName?: string };
            lastUpdated: string;
          }) => ({
            id: draft.id,
            name: draft.data.doorcardName || "Untitled Draft",
            lastUpdated: draft.lastUpdated,
            completionPercentage: calculateCompletionPercentage(draft.data),
          })
        )
      );
    } catch (error) {
      console.error("Error fetching drafts:", error);
      setErrors((prev) => ({ ...prev, drafts: true }));
    } finally {
      setLoading((prev) => ({ ...prev, drafts: false }));
    }
  };

  const fetchDoorcards = async () => {
    setLoading((prev) => ({ ...prev, doorcards: true }));
    setErrors((prev) => ({ ...prev, doorcards: false }));

    try {
      const response = await fetch("/api/doorcards");
      if (!response.ok) {
        throw new Error(`Failed to fetch doorcards: ${response.statusText}`);
      }
      const data = await response.json();
      setDoorcards(data);
    } catch (error) {
      console.error("Error fetching doorcards:", error);
      setErrors((prev) => ({ ...prev, doorcards: true }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doorcards. Please try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, doorcards: false }));
    }
  };

  const fetchRealMetrics = async () => {
    setMetricsLoading(true);
    try {
      const response = await fetch("/api/analytics/metrics");
      if (response.ok) {
        const data = await response.json();
        console.log("Real metrics received:", data);
        setRealMetrics(data);
      } else {
        console.warn(
          "Failed to fetch real metrics, using simulated data. Status:",
          response.status
        );
        // Set real metrics to zeros when API fails instead of using simulation
        setRealMetrics({
          totalViews: 0,
          avgViewsPerCard: 0,
          recentPrints: 0,
          engagementScore: 0,
        });
      }
    } catch (error) {
      console.warn("Error fetching real metrics:", error);
      // Set real metrics to zeros when API fails instead of using simulation
      setRealMetrics({
        totalViews: 0,
        avgViewsPerCard: 0,
        recentPrints: 0,
        engagementScore: 0,
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchDrafts();
    fetchDoorcards();
    fetchRealMetrics();
  }, [status]);

  // Calculate engagement analytics based on real usage patterns
  const calculateEngagementMetrics = () => {
    // This is now replaced by real API data
    // Keeping as fallback for when API is loading
    const totalDoorcards = doorcards.length;

    if (totalDoorcards === 0) {
      return {
        totalViews: 0,
        avgViewsPerCard: 0,
        recentPrints: 0,
        engagementScore: 0,
      };
    }

    // Fallback simulation for loading state
    const mockViewsData = doorcards.map((card) => {
      const daysOld = Math.floor(
        (new Date().getTime() - new Date(card.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const baseViews = card.isActive ? 15 : 5;
      const ageMultiplier = Math.max(0.3, 1 - daysOld / 365);

      // Handle both timeBlocks (legacy) and appointments (current schema)
      const blockCount =
        card.timeBlocks?.length || card.appointments?.length || 0;
      const timeBlockBonus = Math.min(blockCount * 2, 10);

      return Math.floor(
        baseViews * ageMultiplier + timeBlockBonus + Math.random() * 20
      );
    });

    const totalViews = mockViewsData.reduce((sum, views) => sum + views, 0);
    const avgViewsPerCard = Math.round(totalViews / totalDoorcards);
    const recentPrints = Math.floor(totalViews * 0.15);

    let engagementScore = 0;
    const viewScore = Math.min((avgViewsPerCard / 25) * 40, 40);
    engagementScore += viewScore;

    const printScore = Math.min((recentPrints / (totalDoorcards * 2)) * 25, 25);
    engagementScore += printScore;

    const activeRatio =
      doorcards.filter((d) => d.isActive).length / totalDoorcards;
    engagementScore += activeRatio * 20;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyUpdated = doorcards.filter(
      (d) => new Date(d.updatedAt) > thirtyDaysAgo
    ).length;
    const maintenanceScore = (recentlyUpdated / totalDoorcards) * 15;
    engagementScore += maintenanceScore;

    return {
      totalViews,
      avgViewsPerCard,
      recentPrints,
      engagementScore: Math.round(engagementScore),
    };
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80)
      return {
        level: "High Engagement",
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "Excellent viewer activity",
      };
    if (score >= 60)
      return {
        level: "Good Engagement",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "Healthy usage patterns",
      };
    if (score >= 40)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        description: "Room for improvement",
      };
    return {
      level: "Low Engagement",
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Needs attention",
    };
  };

  const engagementMetrics = calculateEngagementMetrics();

  const stats = {
    totalDoorcards: doorcards.length,
    activeDoors: doorcards.filter((d) => d.isActive).length,
    totalDrafts: draftDoorcards.length,
    totalViews: realMetrics?.totalViews ?? engagementMetrics.totalViews,
    avgViewsPerCard:
      realMetrics?.avgViewsPerCard ?? engagementMetrics.avgViewsPerCard,
    recentPrints: realMetrics?.recentPrints ?? engagementMetrics.recentPrints,
    engagementScore:
      realMetrics?.engagementScore ?? engagementMetrics.engagementScore,
  };

  // Filter and sort doorcards
  const filteredDoorcards = doorcards
    .filter((doorcard) => {
      const matchesSearch =
        doorcard.doorcardName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doorcard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doorcard.officeNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterTerm === "all" ||
        (filterTerm === "active" && doorcard.isActive) ||
        (filterTerm === "inactive" && !doorcard.isActive) ||
        doorcard.term.toLowerCase() === filterTerm.toLowerCase();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.doorcardName.localeCompare(b.doorcardName);
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  const handleDeleteDraft = async (draftId: string) => {
    setDeletingDrafts((prev) => new Set(prev).add(draftId));

    try {
      const response = await fetch(`/api/doorcards/draft?id=${draftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      setDraftDoorcards(draftDoorcards.filter((draft) => draft.id !== draftId));

      toast({
        title: "Success",
        description: "Draft deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete draft. Please try again.",
      });
    } finally {
      setDeletingDrafts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(draftId);
        return newSet;
      });
    }
  };

  const handleDeleteAllDrafts = async () => {
    setDeletingAllDrafts(true);

    try {
      const response = await fetch("/api/doorcards/draft?all=true", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all drafts");
      }

      setDraftDoorcards([]);

      toast({
        title: "Success",
        description: "All drafts deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting all drafts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete all drafts. Please try again.",
      });
    } finally {
      setDeletingAllDrafts(false);
    }
  };

  const handlePrint = (doorcard: Doorcard) => {
    router.push(`/create-doorcard/print?id=${doorcard.id}&print=true`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedCards.size === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select doorcards to perform bulk actions.",
      });
      return;
    }

    switch (action) {
      case "delete":
        // Implement bulk delete
        console.log("Bulk delete:", Array.from(selectedCards));
        break;
      case "export":
        // Implement bulk export
        console.log("Bulk export:", Array.from(selectedCards));
        break;
      case "print":
        // Implement bulk print
        console.log("Bulk print:", Array.from(selectedCards));
        break;
    }
  };

  // Show loading skeleton while session is loading
  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Show loading skeleton while data is loading
  if (loading.doorcards && loading.drafts) {
    return <DashboardSkeleton showDrafts={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">My Doorcards</h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{session?.user?.name || session?.user?.email}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="px-6 py-8">
        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Term
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.activeDoors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active doorcards</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalViews}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.totalDrafts}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Simplified Tabs */}
        <Tabs defaultValue="current" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="current">Current Term</TabsTrigger>
              <TabsTrigger value="archives">Archives</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>

            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/create-doorcard">
                <Plus className="h-5 w-5 mr-2" />
                Create New Doorcard
              </Link>
            </Button>
          </div>

          {/* Current Term Doorcards */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Current Term Doorcards</span>
                </CardTitle>
                <CardDescription>
                  Your active doorcards for this term
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredDoorcards.filter((d) => d.isActive).length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No active doorcards
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first doorcard for this term.
                    </p>
                    <Button asChild>
                      <Link href="/create-doorcard">Create Doorcard</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDoorcards
                      .filter((d) => d.isActive)
                      .map((doorcard) => (
                        <DoorcardItem
                          key={doorcard.id}
                          doorcard={doorcard}
                          viewMode="grid"
                          isSelected={false}
                          onSelect={() => {}}
                          onEdit={(id) =>
                            router.push(`/create-doorcard?id=${id}`)
                          }
                          onPrint={handlePrint}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archives */}
          <TabsContent value="archives">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="h-5 w-5" />
                  <span>Archived Doorcards</span>
                </CardTitle>
                <CardDescription>
                  Previous terms and inactive doorcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simple term/year filter for archives */}
                <div className="mb-6 flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search archives..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Years</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>

                {filteredDoorcards.filter((d) => !d.isActive).length === 0 ? (
                  <div className="text-center py-12">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No archived doorcards
                    </h3>
                    <p className="text-gray-500">
                      Your past doorcards will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDoorcards
                      .filter((d) => !d.isActive)
                      .map((doorcard) => (
                        <DoorcardItem
                          key={doorcard.id}
                          doorcard={doorcard}
                          viewMode="list"
                          isSelected={false}
                          onSelect={() => {}}
                          onEdit={(id) =>
                            router.push(`/create-doorcard?id=${id}`)
                          }
                          onPrint={handlePrint}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Edit className="h-5 w-5" />
                      <span>Drafts</span>
                    </CardTitle>
                    <CardDescription>
                      Resume working on incomplete doorcards
                    </CardDescription>
                  </div>
                  {draftDoorcards.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAllDrafts}
                      disabled={deletingAllDrafts}
                    >
                      {deletingAllDrafts ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear All
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {draftDoorcards.length === 0 ? (
                  <div className="text-center py-12">
                    <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No drafts
                    </h3>
                    <p className="text-gray-500">
                      Start working on a doorcard to see your drafts here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {draftDoorcards.map((draft) => (
                      <ResumeDoorcard
                        key={draft.id}
                        draft={draft}
                        onDelete={() => handleDeleteDraft(draft.id)}
                        isDeleting={deletingDrafts.has(draft.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Doorcard Item Component
function DoorcardItem({
  doorcard,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onPrint,
}: {
  doorcard: Doorcard;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onPrint: (doorcard: Doorcard) => void;
}) {
  if (viewMode === "list") {
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(doorcard.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label={`Select ${doorcard.doorcardName}`}
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {doorcard.doorcardName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{doorcard.name}</span>
                  <span>•</span>
                  <span>{doorcard.officeNumber}</span>
                  <span>•</span>
                  {doorcard.college && (
                    <>
                      <span>
                        {COLLEGES.find((c) => c.value === doorcard.college)
                          ?.label || doorcard.college}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    {doorcard.term} {doorcard.year}
                  </span>
                  <span>•</span>
                  <Badge variant={doorcard.isActive ? "default" : "secondary"}>
                    {doorcard.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/view/${doorcard.slug || doorcard.id}`}
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Public
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(doorcard.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(doorcard)}
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(doorcard.id, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            aria-label={`Select ${doorcard.doorcardName}`}
          />
          <Badge variant={doorcard.isActive ? "default" : "secondary"}>
            {doorcard.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardTitle className="text-lg">{doorcard.doorcardName}</CardTitle>
        <CardDescription>
          {doorcard.name} • {doorcard.officeNumber}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          {doorcard.college && (
            <div className="flex justify-between">
              <span>Campus:</span>
              <span className="font-medium">
                {COLLEGES.find((c) => c.value === doorcard.college)?.label ||
                  doorcard.college}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Term:</span>
            <span className="font-medium">
              {doorcard.term} {doorcard.year}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Time Blocks:</span>
            <span className="font-medium">
              {doorcard.timeBlocks?.length ||
                doorcard.appointments?.length ||
                0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Updated:</span>
            <span className="font-medium">
              {new Date(doorcard.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link
              href={`/view/${doorcard.slug || doorcard.id}`}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Public Page
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(doorcard.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(doorcard)}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateCompletionPercentage(data: CompletionData): number {
  let totalPoints = 0;
  let earnedPoints = 0;

  const basicInfoFields = {
    name: 8,
    doorcardName: 8,
    officeNumber: 8,
    term: 8,
    year: 8,
  };

  Object.entries(basicInfoFields).forEach(([field, points]) => {
    totalPoints += points;
    if (data[field]) earnedPoints += points;
  });

  const timeBlockPoints = 40;
  totalPoints += timeBlockPoints;

  if (data.timeBlocks && data.timeBlocks.length > 0) {
    const blockCount = Math.min(data.timeBlocks.length, 5);
    earnedPoints += timeBlockPoints * (blockCount / 5);

    const completeBlocks = data.timeBlocks.filter(
      (block: {
        day: string;
        startTime: string;
        endTime: string;
        activity: string;
      }) => block.day && block.startTime && block.endTime && block.activity
    ).length;

    if (
      data.timeBlocks &&
      completeBlocks === data.timeBlocks.length &&
      completeBlocks > 0
    ) {
      earnedPoints += 5;
    }
  }

  const previewPoints = 20;
  totalPoints += previewPoints;
  if (data.hasViewedPreview) earnedPoints += previewPoints / 2;
  if (data.hasViewedPrint) earnedPoints += previewPoints / 2;

  return Math.round((earnedPoints / totalPoints) * 100);
}
