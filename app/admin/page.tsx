"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Archive,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Term {
  id: string;
  name: string;
  year: string;
  season: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  isUpcoming: boolean;
  archiveDate?: string;
  _count: {
    doorcards: number;
  };
}

interface Doorcard {
  id: string;
  name: string;
  doorcardName: string;
  officeNumber: string;
  term: string;
  year: string;
  college: string;
  isActive: boolean;
  isPublic: boolean;
  slug: string;
  user: {
    name: string;
    email: string;
    username?: string;
    college: string;
  };
  _count: {
    appointments: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [terms, setTerms] = useState<Term[]>([]);
  const [doorcards, setDoorcards] = useState<Doorcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateTerm, setShowCreateTerm] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedDoorcards, setSelectedDoorcards] = useState<string[]>([]);
  const [showEditDoorcard, setShowEditDoorcard] = useState(false);
  const [editingDoorcard, setEditingDoorcard] = useState<Doorcard | null>(null);
  const [editForm, setEditForm] = useState({
    doorcardName: "",
    officeNumber: "",
    startDate: "",
    endDate: "",
    term: "",
    year: "",
    college: "",
    isPublic: true,
    timeblocks: [] as Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      name: string;
      category: string;
      location?: string;
    }>,
  });

  // New term form state
  const [newTerm, setNewTerm] = useState({
    name: "",
    year: "",
    season: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  // Check if user is admin - simplified for now
  const isAdmin = !!session; // Just require any logged-in user

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !isAdmin) {
      window.location.href = "/dashboard";
      return;
    }

    fetchData();
  }, [session, status, isAdmin]);

  const fetchData = async () => {
    try {
      console.log("🔍 Fetching admin data...");
      const [termsRes, doorcardsRes] = await Promise.all([
        fetch("/api/terms"),
        fetch("/api/doorcards/admin"),
      ]);

      console.log("📊 Terms response:", termsRes.status, termsRes.ok);
      console.log(
        "📊 Doorcards response:",
        doorcardsRes.status,
        doorcardsRes.ok
      );

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        console.log("📅 Terms data:", termsData);
        setTerms(termsData);
      } else {
        const errorText = await termsRes.text();
        console.error("❌ Terms API error:", errorText);
      }

      if (doorcardsRes.ok) {
        const doorcardsData = await doorcardsRes.json();
        console.log("📋 Doorcards data:", doorcardsData.length, "items");
        setDoorcards(doorcardsData);
      } else {
        const errorText = await doorcardsRes.text();
        console.error("❌ Doorcards API error:", errorText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const archiveTerm = async (termId: string, termName: string) => {
    setArchiving(termId);
    try {
      const response = await fetch("/api/terms/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termId, archiveDoorcards: true }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Archived ${termName} and its doorcards`,
        });
        fetchData(); // Refresh data
      } else {
        throw new Error("Failed to archive term");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive term",
        variant: "destructive",
      });
    } finally {
      setArchiving(null);
    }
  };

  const createTerm = async () => {
    try {
      const response = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTerm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Created term: ${newTerm.name}`,
        });
        setShowCreateTerm(false);
        setNewTerm({
          name: "",
          year: "",
          season: "",
          startDate: "",
          endDate: "",
          isActive: false,
        });
        fetchData();
      } else {
        throw new Error("Failed to create term");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create term",
        variant: "destructive",
      });
    }
  };

  const transitionToTerm = async (termId: string, termName: string) => {
    try {
      const response = await fetch("/api/terms/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTermId: termId,
          options: {
            archiveOldTerm: true,
            activateNewTerm: true,
            archiveOldDoorcards: true,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Activated ${termName} and archived previous term`,
        });
        fetchData();
      } else {
        throw new Error("Failed to transition term");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transition term",
        variant: "destructive",
      });
    }
  };

  const toggleDoorcardStatus = async (
    doorcardId: string,
    isActive: boolean,
    isPublic: boolean
  ) => {
    try {
      const response = await fetch(`/api/doorcards/${doorcardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, isPublic }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Doorcard status updated",
        });
        fetchData(); // Refresh data
      } else {
        throw new Error("Failed to update doorcard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doorcard status",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateDoorcards = async (isActive: boolean, isPublic: boolean) => {
    try {
      const promises = selectedDoorcards.map((id) =>
        fetch(`/api/doorcards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive, isPublic }),
        })
      );

      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Updated ${selectedDoorcards.length} doorcards`,
      });
      setSelectedDoorcards([]);
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doorcards",
        variant: "destructive",
      });
    }
  };

  const editDoorcard = async () => {
    if (!editingDoorcard) return;

    try {
      const response = await fetch(`/api/doorcards/${editingDoorcard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Updated doorcard for ${editingDoorcard.user.name}`,
        });
        setShowEditDoorcard(false);
        setEditingDoorcard(null);
        setEditForm({
          doorcardName: "",
          officeNumber: "",
          startDate: "",
          endDate: "",
          term: "",
          year: "",
          college: "",
          isPublic: true,
          timeblocks: [],
        });
        fetchData();
      } else {
        throw new Error("Failed to update doorcard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doorcard",
        variant: "destructive",
      });
    }
  };

  const openEditDoorcard = async (doorcard: any) => {
    // Fetch timeblocks for this doorcard
    try {
      const timeblocksRes = await fetch(
        `/api/doorcards/${doorcard.id}/timeblocks`
      );
      const timeblocks = timeblocksRes.ok ? await timeblocksRes.json() : [];

      setEditingDoorcard(doorcard);
      setEditForm({
        doorcardName: doorcard.doorcardName,
        officeNumber: doorcard.officeNumber,
        startDate: doorcard.startDate
          ? new Date(doorcard.startDate).toISOString().split("T")[0]
          : "",
        endDate: doorcard.endDate
          ? new Date(doorcard.endDate).toISOString().split("T")[0]
          : "",
        term: doorcard.term,
        year: doorcard.year,
        college: doorcard.college || "",
        isPublic: doorcard.isPublic,
        timeblocks: timeblocks.map((tb: any) => ({
          dayOfWeek: tb.dayOfWeek,
          startTime: tb.startTime,
          endTime: tb.endTime,
          name: tb.name,
          category: tb.category,
          location: tb.location,
        })),
      });
      setShowEditDoorcard(true);
    } catch (error) {
      console.error("Error fetching timeblocks:", error);
      // Still open the modal with basic data
      setEditingDoorcard(doorcard);
      setEditForm({
        doorcardName: doorcard.doorcardName,
        officeNumber: doorcard.officeNumber,
        startDate: doorcard.startDate
          ? new Date(doorcard.startDate).toISOString().split("T")[0]
          : "",
        endDate: doorcard.endDate
          ? new Date(doorcard.endDate).toISOString().split("T")[0]
          : "",
        term: doorcard.term,
        year: doorcard.year,
        college: doorcard.college || "",
        isPublic: doorcard.isPublic,
        timeblocks: [],
      });
      setShowEditDoorcard(true);
    }
  };

  const exportDoorcards = () => {
    const csvData = doorcards.map((d) => ({
      Name: d.name,
      "Doorcard Name": d.doorcardName,
      "Office Number": d.officeNumber,
      Term: d.term,
      Year: d.year,
      College: d.college,
      "Is Active": d.isActive,
      "Is Public": d.isPublic,
      "Appointments Count": d._count.appointments,
      Email: d.user.email,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doorcards-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Filter doorcards based on search and filters
  const filteredDoorcards = doorcards.filter((doorcard) => {
    const matchesSearch =
      doorcard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doorcard.doorcardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doorcard.officeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doorcard.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollege =
      filterCollege === "all" || doorcard.college === filterCollege;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && doorcard.isActive) ||
      (filterStatus === "inactive" && !doorcard.isActive) ||
      (filterStatus === "public" && doorcard.isPublic) ||
      (filterStatus === "private" && !doorcard.isPublic);

    return matchesSearch && matchesCollege && matchesStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null; // Will redirect
  }

  const activeTerm = terms.find((t) => t.isActive);
  const archivedTerms = terms.filter((t) => t.isArchived);
  const upcomingTerms = terms.filter((t) => t.isUpcoming);

  console.log("🔍 Current state:", {
    termsCount: terms.length,
    doorcardsCount: doorcards.length,
    activeTerm: activeTerm?.name,
    archivedTermsCount: archivedTerms.length,
    upcomingTermsCount: upcomingTerms.length,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage terms and oversee doorcards</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Term Management</TabsTrigger>
          <TabsTrigger value="doorcards">Doorcard Oversight</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Term
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeTerm ? activeTerm.name : "None"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeTerm
                    ? `${activeTerm._count.doorcards} doorcards`
                    : "No active term"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Terms
                </CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{terms.length}</div>
                <p className="text-xs text-muted-foreground">
                  {archivedTerms.length} archived, {upcomingTerms.length}{" "}
                  upcoming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Doorcards
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doorcards.length}</div>
                <p className="text-xs text-muted-foreground">
                  {doorcards.filter((d) => d.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(doorcards.map((d) => d.user.email)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique faculty members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={exportDoorcards} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Doorcards
              </Button>
              <Dialog open={showCreateTerm} onOpenChange={setShowCreateTerm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Term
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Term</DialogTitle>
                    <DialogDescription>
                      Add a new academic term to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Term Name</Label>
                        <Input
                          id="name"
                          value={newTerm.name}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, name: e.target.value })
                          }
                          placeholder="Fall 2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={newTerm.year}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, year: e.target.value })
                          }
                          placeholder="2025"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="season">Season</Label>
                      <Select
                        value={newTerm.season}
                        onValueChange={(value) =>
                          setNewTerm({ ...newTerm, season: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newTerm.startDate}
                          onChange={(e) =>
                            setNewTerm({
                              ...newTerm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newTerm.endDate}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newTerm.isActive}
                        onChange={(e) =>
                          setNewTerm({ ...newTerm, isActive: e.target.checked })
                        }
                      />
                      <Label htmlFor="isActive">Set as active term</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTerm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createTerm}>Create Term</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Term Management</CardTitle>
              <Dialog open={showCreateTerm} onOpenChange={setShowCreateTerm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Term
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Term</DialogTitle>
                    <DialogDescription>
                      Add a new academic term to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Term Name</Label>
                        <Input
                          id="name"
                          value={newTerm.name}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, name: e.target.value })
                          }
                          placeholder="Fall 2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={newTerm.year}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, year: e.target.value })
                          }
                          placeholder="2025"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="season">Season</Label>
                      <Select
                        value={newTerm.season}
                        onValueChange={(value) =>
                          setNewTerm({ ...newTerm, season: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newTerm.startDate}
                          onChange={(e) =>
                            setNewTerm({
                              ...newTerm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newTerm.endDate}
                          onChange={(e) =>
                            setNewTerm({ ...newTerm, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newTerm.isActive}
                        onChange={(e) =>
                          setNewTerm({ ...newTerm, isActive: e.target.checked })
                        }
                      />
                      <Label htmlFor="isActive">Set as active term</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTerm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createTerm}>Create Term</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {terms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No terms found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {loading ? "Loading terms..." : "Try refreshing the page"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {terms.map((term) => (
                    <div
                      key={term.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{term.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(term.startDate).toLocaleDateString()} -{" "}
                            {new Date(term.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {term._count.doorcards} doorcards
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {term.isActive && (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        {term.isArchived && (
                          <Badge variant="secondary">
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </Badge>
                        )}
                        {term.isUpcoming && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Upcoming
                          </Badge>
                        )}
                        {!term.isActive && !term.isArchived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => transitionToTerm(term.id, term.name)}
                          >
                            Activate
                          </Button>
                        )}
                        {!term.isArchived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => archiveTerm(term.id, term.name)}
                            disabled={archiving === term.id}
                          >
                            {archiving === term.id ? "Archiving..." : "Archive"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doorcards" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Doorcard Oversight</CardTitle>
              <div className="flex items-center space-x-2">
                <Button onClick={exportDoorcards} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {selectedDoorcards.length > 0 && (
                  <Dialog
                    open={showBulkActions}
                    onOpenChange={setShowBulkActions}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Bulk Actions ({selectedDoorcards.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bulk Actions</DialogTitle>
                        <DialogDescription>
                          Apply actions to {selectedDoorcards.length} selected
                          doorcards.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => bulkUpdateDoorcards(true, true)}
                          variant="outline"
                        >
                          Activate & Make Public
                        </Button>
                        <Button
                          onClick={() => bulkUpdateDoorcards(false, false)}
                          variant="outline"
                        >
                          Deactivate & Make Private
                        </Button>
                        <Button
                          onClick={() => bulkUpdateDoorcards(true, false)}
                          variant="outline"
                        >
                          Activate & Make Private
                        </Button>
                        <Button
                          onClick={() => bulkUpdateDoorcards(false, true)}
                          variant="outline"
                        >
                          Deactivate & Make Public
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search doorcards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select
                    value={filterCollege}
                    onValueChange={setFilterCollege}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      <SelectItem value="SKYLINE">Skyline</SelectItem>
                      <SelectItem value="CSM">CSM</SelectItem>
                      <SelectItem value="CANADA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredDoorcards.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No doorcards found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {loading
                      ? "Loading doorcards..."
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDoorcards.map((doorcard) => (
                    <div
                      key={doorcard.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        selectedDoorcards.includes(doorcard.id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedDoorcards.includes(doorcard.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDoorcards([
                                ...selectedDoorcards,
                                doorcard.id,
                              ]);
                            } else {
                              setSelectedDoorcards(
                                selectedDoorcards.filter(
                                  (id) => id !== doorcard.id
                                )
                              );
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <div>
                          <h3 className="font-medium">
                            {doorcard.doorcardName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {doorcard.name} • {doorcard.officeNumber} •{" "}
                            {doorcard.college}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doorcard.term} {doorcard.year} •{" "}
                            {doorcard._count.appointments} appointments
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={doorcard.isPublic ? "default" : "outline"}
                        >
                          {doorcard.isPublic ? "Public" : "Private"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDoorcard(doorcard)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open doorcard in new tab using authenticated endpoint - works for both active and inactive
                            // Use username-based URL structure
                            const username =
                              doorcard.user?.username ||
                              doorcard.user?.name
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") ||
                              doorcard.user?.email?.split("@")[0] ||
                              "user";
                            const termSlug = `${doorcard.term.toLowerCase()}-${
                              doorcard.year
                            }`;
                            window.open(
                              `/view/${username}/${termSlug}?auth=true`,
                              "_blank"
                            );
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Doorcard Modal */}
          <Dialog open={showEditDoorcard} onOpenChange={setShowEditDoorcard}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Edit Doorcard - Complete Faculty Support
                </DialogTitle>
                <DialogDescription>
                  {editingDoorcard && (
                    <span>
                      Editing doorcard for{" "}
                      <strong>{editingDoorcard.user.name}</strong> (
                      {editingDoorcard.user.email})
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-doorcardName">Doorcard Name</Label>
                      <Input
                        id="edit-doorcardName"
                        value={editForm.doorcardName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            doorcardName: e.target.value,
                          })
                        }
                        placeholder="e.g., Dr. Smith's Office Hours"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-officeNumber">Office Number</Label>
                      <Input
                        id="edit-officeNumber"
                        value={editForm.officeNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            officeNumber: e.target.value,
                          })
                        }
                        placeholder="e.g., 2101, 17-201"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-term">Term</Label>
                      <Input
                        id="edit-term"
                        value={editForm.term}
                        onChange={(e) =>
                          setEditForm({ ...editForm, term: e.target.value })
                        }
                        placeholder="e.g., Fall, Spring, Summer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-year">Year</Label>
                      <Input
                        id="edit-year"
                        value={editForm.year}
                        onChange={(e) =>
                          setEditForm({ ...editForm, year: e.target.value })
                        }
                        placeholder="e.g., 2024, 2025"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-college">College</Label>
                      <Select
                        value={editForm.college}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, college: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select college" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SKYLINE">
                            Skyline College
                          </SelectItem>
                          <SelectItem value="CSM">
                            College of San Mateo
                          </SelectItem>
                          <SelectItem value="CANADA">Cañada College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">
                    Schedule Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-startDate">Start Date</Label>
                      <Input
                        id="edit-startDate"
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-endDate">End Date</Label>
                      <Input
                        id="edit-endDate"
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Status</h3>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isPublic"
                        checked={editForm.isPublic}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            isPublic: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-isPublic">
                        Public (visible to students)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Timeblocks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium border-b pb-2">
                      Schedule & Appointments
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditForm({
                          ...editForm,
                          timeblocks: [
                            ...editForm.timeblocks,
                            {
                              dayOfWeek: "MONDAY",
                              startTime: "09:00",
                              endTime: "10:00",
                              name: "Office Hours",
                              category: "OFFICE_HOURS",
                              location: "",
                            },
                          ],
                        });
                      }}
                    >
                      Add Schedule Item
                    </Button>
                  </div>

                  {editForm.timeblocks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No office hours scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {editForm.timeblocks.map((timeblock, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <Select
                            value={timeblock.dayOfWeek}
                            onValueChange={(value) => {
                              const newTimeblocks = [...editForm.timeblocks];
                              newTimeblocks[index].dayOfWeek = value;
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONDAY">Monday</SelectItem>
                              <SelectItem value="TUESDAY">Tuesday</SelectItem>
                              <SelectItem value="WEDNESDAY">
                                Wednesday
                              </SelectItem>
                              <SelectItem value="THURSDAY">Thursday</SelectItem>
                              <SelectItem value="FRIDAY">Friday</SelectItem>
                              <SelectItem value="SATURDAY">Saturday</SelectItem>
                              <SelectItem value="SUNDAY">Sunday</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="time"
                            value={timeblock.startTime}
                            onChange={(e) => {
                              const newTimeblocks = [...editForm.timeblocks];
                              newTimeblocks[index].startTime = e.target.value;
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                            className="w-24"
                          />

                          <span>to</span>

                          <Input
                            type="time"
                            value={timeblock.endTime}
                            onChange={(e) => {
                              const newTimeblocks = [...editForm.timeblocks];
                              newTimeblocks[index].endTime = e.target.value;
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                            className="w-24"
                          />

                          <Input
                            placeholder="Name"
                            value={timeblock.name}
                            onChange={(e) => {
                              const newTimeblocks = [...editForm.timeblocks];
                              newTimeblocks[index].name = e.target.value;
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                            className="w-32"
                          />

                          <Select
                            value={timeblock.category}
                            onValueChange={(value) => {
                              const newTimeblocks = [...editForm.timeblocks];
                              newTimeblocks[index].category = value;
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OFFICE_HOURS">
                                Office Hours
                              </SelectItem>
                              <SelectItem value="IN_CLASS">In Class</SelectItem>
                              <SelectItem value="LECTURE">Lecture</SelectItem>
                              <SelectItem value="LAB">Lab</SelectItem>
                              <SelectItem value="HOURS_BY_ARRANGEMENT">
                                Hours by Arrangement
                              </SelectItem>
                              <SelectItem value="REFERENCE">
                                Reference
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTimeblocks = editForm.timeblocks.filter(
                                (_, i) => i !== index
                              );
                              setEditForm({
                                ...editForm,
                                timeblocks: newTimeblocks,
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDoorcard(false)}
                >
                  Cancel
                </Button>
                <Button onClick={editDoorcard}>Save All Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
