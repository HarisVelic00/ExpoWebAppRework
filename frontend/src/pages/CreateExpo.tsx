import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Industry, Location, Expo } from "@/types/expo";

type ExpoFormData = {
  title: string;
  description: string;
  date_of_opening: string;
  date_of_closing: string;
  work_hours_opening: string;
  work_hours_closing: string;
  location_id: string;
  industry_id: string;
};

const initialFormData: ExpoFormData = {
  title: "",
  description: "",
  date_of_opening: "",
  date_of_closing: "",
  work_hours_opening: "",
  work_hours_closing: "",
  location_id: "",
  industry_id: "",
};

function CreateExpo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { expoId } = useParams();
  const isEditing = Boolean(expoId);
  const [formData, setFormData] = useState<ExpoFormData>(initialFormData);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = user?.role === "organizer" || user?.role === "admin";

  useEffect(() => {
    if (!canManage) {
      navigate("/dashboard", { replace: true });
      return;
    }

    async function loadFormData() {
      try {
        const [industryData, locationData] = await Promise.all([
          apiRequest<Industry[]>("/industries/"),
          apiRequest<Location[]>("/locations/"),
        ]);
        setIndustries(industryData);
        setLocations(locationData);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load form data.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadFormData();
  }, [canManage, navigate]);

  useEffect(() => {
    if (!expoId) return;

    async function loadExpo() {
      try {
        const expo = await apiRequest<Expo>(`/expos/${expoId}`);

        setFormData({
          title: expo.title ?? "",
          description: expo.description ?? "",
          date_of_opening: expo.date_of_opening.slice(0, 16),
          date_of_closing: expo.date_of_closing.slice(0, 16),
          work_hours_opening: expo.work_hours_opening ?? "",
          work_hours_closing: expo.work_hours_closing ?? "",
          location_id: expo.location_id ? String(expo.location_id) : "",
          industry_id: String(expo.industry_id),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load exhibition.",
        );
        navigate("/dashboard/expos");
      }
    }
    loadExpo();
  }, [expoId, navigate]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      toast.error("Please enter an exhibition title.");
      return;
    }
    if (!formData.industry_id) {
      toast.error("Please select an industry.");
      return;
    }
    if (!formData.date_of_opening || !formData.date_of_closing) {
      toast.error("Please select both opening and closing dates.");
      return;
    }
    if (
      new Date(formData.date_of_closing) <= new Date(formData.date_of_opening)
    ) {
      toast.error("Closing date must be after opening date.");
      return;
    }
    setIsSubmitting(true);

    try {
      await apiRequest<Expo>(isEditing ? `/expos/${expoId}` : "/expos/", {
        method: isEditing ? "PUT" : "POST",
        body: {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          date_of_opening: formData.date_of_opening,
          date_of_closing: formData.date_of_closing,
          work_hours_opening: formData.work_hours_opening || null,
          work_hours_closing: formData.work_hours_closing || null,
          location_id: formData.location_id
            ? Number(formData.location_id)
            : null,
          industry_id: Number(formData.industry_id),
        },
      });
      toast.success(
        isEditing
          ? "Exhibition updated successfully."
          : "Exhibition created successfully.",
      );
      navigate("/dashboard/expos");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Failed to update exhibition."
            : "Failed to create exhibition.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Exhibition" : "Create Exhibition"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your exhibition details."
              : "Fill in the details to create a new exhibition."}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading form data...</p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="space-y-8 rounded-xl border bg-background p-6 shadow-sm"
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Basic information</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the main details of your exhibition.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Exhibition title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter exhibition title"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your exhibition..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold">Exhibition dates</h3>
                  <p className="text-sm text-muted-foreground">
                    When will your exhibition take place?
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_opening">
                      Opening date and time
                    </Label>
                    <Input
                      id="date_of_opening"
                      name="date_of_opening"
                      type="datetime-local"
                      value={formData.date_of_opening}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_closing">
                      Closing date and time
                    </Label>
                    <Input
                      id="date_of_closing"
                      name="date_of_closing"
                      type="datetime-local"
                      value={formData.date_of_closing}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">Daily working hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Set the hours visitors can attend.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="work_hours_opening">Opening time</Label>
                    <Input
                      id="work_hours_opening"
                      name="work_hours_opening"
                      type="time"
                      value={formData.work_hours_opening}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work_hours_closing">Closing time</Label>
                    <Input
                      id="work_hours_closing"
                      name="work_hours_closing"
                      type="time"
                      value={formData.work_hours_closing}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">
                    Classification and location
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the industry and exhibition location.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={formData.industry_id}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          industry_id: value ?? "",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>

                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem
                            key={industry.id}
                            value={String(industry.id)}
                          >
                            {industry.name ?? "Unnamed industry"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select
                      value={formData.location_id}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          location_id: value ?? "",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>

                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem
                            key={location.id}
                            value={String(location.id)}
                          >
                            {[location.address, location.city]
                              .filter(Boolean)
                              .join(", ") || location.zip_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/expos")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Exhibition"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreateExpo;
