import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiRequest } from "@/lib/api";
import type { Expo, Industry, Location } from "@/types/expo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TicketType = {
  id: number;
  name: string;
  valid_days_count: number;
  price: string;
  expo_id: number;
};

function ExpoDetails() {
  const { expoId } = useParams();
  const navigate = useNavigate();
  const [expo, setExpo] = useState<Expo | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user } = useAuth();

  const getIndustryName = (industryId: number | null) => {
    return (
      industries.find((industry) => industry.id === industryId)?.name ??
      "Unknown industry"
    );
  };

  const getLocationName = (locationId: number | null) => {
    const location = locations.find((location) => location.id === locationId);
    if (!location) return "Unknown location";
    return (
      [location.address, location.city].filter(Boolean).join(", ") ||
      location.zip_code
    );
  };

  useEffect(() => {
    async function loadExpoDetails() {
      if (!expoId) {
        toast.error("Invalid exhibition ID.");
        navigate("/dashboard/expos");
        return;
      }

      try {
        const [expoData, industryData, locationData, ticketTypeData] =
          await Promise.all([
            apiRequest<Expo>(`/expos/${expoId}`),
            apiRequest<Industry[]>("/industries/"),
            apiRequest<Location[]>("/locations/"),
            apiRequest<TicketType[]>("/ticket-types/"),
          ]);
        setExpo(expoData);
        setIndustries(industryData);
        setLocations(locationData);
        setTicketTypes(
          ticketTypeData.filter((type) => type.expo_id === expoData.id),
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load exhibition details.",
        );
        navigate("/dashboard/expos");
      } finally {
        setIsLoading(false);
      }
    }
    loadExpoDetails();
  }, [expoId, navigate]);

  async function handlePurchase() {
    if (!selectedTicketType || !purchaseDate) {
      toast.error("Please select a ticket type and purchase date.");
      return;
    }
    setIsPurchasing(true);
    try {
      await apiRequest("/tickets/purchase", {
        method: "POST",
        body: {
          ticket_type_id: Number(selectedTicketType),
          date_from: `${purchaseDate}T09:00:00`,
        },
      });
      toast.success("Ticket purchased successfully!");
      navigate("/dashboard/tickets");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase ticket.",
      );
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Exhibition details</h1>

          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/expos")}
          >
            Back to exhibitions
          </Button>
        </div>

        {isLoading ? (
          <p>Loading exhibition...</p>
        ) : expo ? (
          <>
            <div className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">{expo.title}</h2>
              <p className="text-muted-foreground">
                {expo.description || "No description available."}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-medium">Industry</p>
                  <p>{getIndustryName(expo.industry_id)}</p>
                </div>

                <div>
                  <p className="font-medium">Location</p>
                  <p>{getLocationName(expo.location_id)}</p>
                </div>

                <div>
                  <p className="font-medium">Opening date</p>
                  <p>{new Date(expo.date_of_opening).toLocaleString()}</p>
                </div>

                <div>
                  <p className="font-medium">Closing date</p>
                  <p>{new Date(expo.date_of_closing).toLocaleString()}</p>
                </div>

                <div>
                  <p className="font-medium">Opening hours</p>
                  <p>
                    {expo.work_hours_opening || "-"} -{" "}
                    {expo.work_hours_closing || "-"}
                  </p>
                </div>
              </div>
            </div>

            {user?.role === "visitor" && (
              <div className="space-y-4 rounded-lg border p-6">
                <h2 className="text-xl font-semibold">Purchase a ticket</h2>

                {ticketTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tickets are available for this exhibition.
                  </p>
                ) : (
                  <>
                    <div className="max-w-xl space-y-4">
                      <div className="space-y-2">
                        <Label>Ticket type</Label>

                        <Select
                          value={selectedTicketType}
                          onValueChange={(value) =>
                            setSelectedTicketType(value ?? "")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a ticket type" />
                          </SelectTrigger>

                          <SelectContent className="w-full">
                            {ticketTypes.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={String(type.id)}
                                className="whitespace-normal"
                              >
                                {type.name} - {Number(type.price).toFixed(2)} KM
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Start date</Label>

                        <Input
                          id="purchaseDate"
                          type="date"
                          min={expo.date_of_opening.slice(0, 10)}
                          max={expo.date_of_closing.slice(0, 10)}
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handlePurchase}
                        disabled={
                          isPurchasing || !selectedTicketType || !purchaseDate
                        }
                      >
                        {isPurchasing ? "Purchasing..." : "Purchase Ticket"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <p>Exhibition not found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
export default ExpoDetails;
