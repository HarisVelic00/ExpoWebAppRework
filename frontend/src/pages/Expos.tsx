import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { CalendarDays, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Expo, Industry, Location } from "@/types/expo";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Expos() {
  const { user } = useAuth();
  const [expos, setExpos] = useState<Expo[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [expoToDelete, setExpoToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const canManage = user?.role === "organizer" || user?.role === "admin";

  async function loadExpos() {
    try {
      const [expoData, industryData, locationData] = await Promise.all([
        apiRequest<Expo[]>("/expos/"),
        apiRequest<Industry[]>("/industries"),
        apiRequest<Location[]>("/locations/"),
      ]);

      setExpos(
        user?.role === "organizer"
          ? expoData.filter((expo) => expo.organiser_id === user.id)
          : expoData,
      );
      setIndustries(industryData);
      setLocations(locationData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load exhibitions.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadExpos();
  }, [user?.id, user?.role]);

  async function handleDelete(expoId: number) {
    try {
      await apiRequest<void>(`/expos/${expoId}`, {
        method: "DELETE",
      });
      setExpos((current) => current.filter((expo) => expo.id !== expoId));
      toast.success("Exhibition deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete exhibition.",
      );
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  function getIndustryName(id: number) {
    return industries.find((industry) => industry.id === id)?.name ?? "Unknown";
  }

  function getLocationName(id: number | null) {
    if (id === null) return "No location";
    const location = locations.find((item) => item.id === id);

    return location
      ? [location.address, location.city].filter(Boolean).join(", ")
      : "Unknown location";
  }

  const filteredExpos = expos.filter((expo) => {
    const matchesSearch = (expo.title ?? "")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    const matchesIndustry =
      selectedIndustry === "all" ||
      String(expo.industry_id) === selectedIndustry;

    const matchesLocation =
      selectedLocation === "all" ||
      String(expo.location_id) === selectedLocation;

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Exhibitions</h2>
            <p className="text-sm text-muted-foreground">
              Browse and manage exhibitions.
            </p>
          </div>

          {canManage && (
            <Link
              to="/dashboard/expos/create"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Create Expo
            </Link>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Search exhibitions  by title..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <Select
            value={selectedIndustry}
            onValueChange={(value) => setSelectedIndustry(value ?? "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={String(industry.id)}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation}
            onValueChange={(value) => setSelectedLocation(value ?? "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
                  {location.city}, {location.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading exhibitions...
          </p>
        ) : filteredExpos.length === 0 ? (
          <div className="rounded-xl border bg-background p-10 text-center">
            <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h3 className="font-semibold">
              {expos.length === 0
                ? "No exhibitions found"
                : "No matching exhibitions"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {expos.length === 0
                ? "Exhibitions will appear here when they are available."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExpos.map((expo) => (
              <div
                key={expo.id}
                className="rounded-xl border bg-background p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {expo.title || "Untitled exhibition"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getIndustryName(expo.industry_id)}
                    </p>
                  </div>

                  <CalendarDays className="size-5 shrink-0 text-muted-foreground" />
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                  {expo.description || "No description available."}
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Opening: </span>
                    {formatDate(expo.date_of_opening)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Closing: </span>
                    {formatDate(expo.date_of_closing)}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {getLocationName(expo.location_id)}
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/expos/${expo.id}`)}
                  >
                    Details
                  </Button>

                  {canManage &&
                    (user?.role === "admin" ||
                      expo.organiser_id === user?.id) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/dashboard/expos/${expo.id}/edit`)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setExpoToDelete(expo.id)}
                        >
                          <Trash2 className="mr-2 size-4"></Trash2>Delete
                        </Button>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={expoToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setExpoToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exhibition?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exhibition? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expoToDelete !== null) {
                  handleDelete(expoToDelete);
                  setExpoToDelete(null);
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

export default Expos;
