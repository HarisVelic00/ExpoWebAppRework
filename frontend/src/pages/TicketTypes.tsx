import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tags, Plus } from "lucide-react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Navigate } from "react-router";

type Expo = {
  id: number;
  title: string | null;
  organiser_id: number | null;
};

type TicketType = {
  id: number;
  name: string;
  valid_days_count: number;
  price: string;
  expo_id: number;
};

function TicketTypes() {
  const { user } = useAuth();
  const canManage = user?.role === "organizer" || user?.role === "admin";
  const [expos, setExpos] = useState<Expo[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [name, setName] = useState("");
  const [validDays, setValidDays] = useState("");
  const [price, setPrice] = useState("");
  const [selectedExpo, setSelectedExpo] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDays, setEditDays] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editExpo, setEditExpo] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<Expo[]>("/expos/"),
      apiRequest<TicketType[]>("/ticket-types/"),
    ])
      .then(([expoData, typeData]) => {
        const availableExpos =
          user?.role === "organizer"
            ? expoData.filter((expo) => expo.organiser_id === user.id)
            : expoData;

        setExpos(availableExpos);
        setTicketTypes(typeData);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load ticket types.",
        );
      })
      .finally(() => setLoading(false));
  }, [user?.id, user?.role]);

  const visibleTicketTypes =
    user?.role === "organizer"
      ? ticketTypes.filter((type) =>
          expos.some((expo) => expo.id === type.expo_id),
        )
      : ticketTypes;

  const handleCreate = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !selectedExpo || !validDays || !price) {
      toast.error("Please complete all fields.");
      return;
    }

    if (!Number.isInteger(Number(validDays)) || Number(validDays) < 1) {
      toast.error("Validity must be at least 1 day.");
      return;
    }

    setCreating(true);

    try {
      const newTicketType = await apiRequest<TicketType>("/ticket-types/", {
        method: "POST",
        body: {
          name: name.trim(),
          valid_days_count: Number(validDays),
          price: Number(price),
          expo_id: Number(selectedExpo),
        },
      });

      setTicketTypes((current) => [...current, newTicketType]);
      setName("");
      setValidDays("1");
      setPrice("");
      toast.success("Ticket type created successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create ticket type.",
      );
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (type: TicketType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditDays(String(type.valid_days_count));
    setEditPrice(String(type.price));
    setEditExpo(String(type.expo_id));
  };

  const handleUpdate = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !editName.trim() ||
      !Number.isInteger(Number(editDays)) ||
      Number(editDays) < 1 ||
      !Number.isFinite(Number(editPrice)) ||
      Number(editPrice) <= 0 ||
      !editExpo
    ) {
      toast.error("Please enter valid ticket type details.");
      return;
    }

    setSaving(true);

    try {
      const updated = await apiRequest<TicketType>(
        `/ticket-types/${editingId}`,
        {
          method: "PUT",
          body: {
            name: editName.trim(),
            valid_days_count: Number(editDays),
            price: Number(editPrice),
            expo_id: Number(editExpo),
          },
        },
      );

      setTicketTypes((current) =>
        current.map((type) => (type.id === editingId ? updated : type)),
      );

      setEditingId(null);
      toast.success("Ticket type updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update ticket type.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      await apiRequest(`/ticket-types/${id}`, {
        method: "DELETE",
      });

      setTicketTypes((current) => current.filter((type) => type.id !== id));
      toast.success("Ticket type deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete ticket type.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (user && user.role !== "organizer" && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Types</h1>
          <p className="text-muted-foreground">
            Create and view ticket types for your exhibitions.
          </p>
        </div>

        {canManage && (
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded-xl border bg-card p-5"
          >
            <div>
              <h2 className="text-lg font-semibold">Create ticket type</h2>
              <p className="text-sm text-muted-foreground">
                Define the name, validity period and price.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Ticket type name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <Select
                value={selectedExpo}
                onValueChange={(value) => setSelectedExpo(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select exhibition" />
                </SelectTrigger>
                <SelectContent>
                  {expos.map((expo) => (
                    <SelectItem key={expo.id} value={String(expo.id)}>
                      {expo.title ?? `Exhibition #${expo.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Number of days (e.g. 3)"
                value={validDays}
                onChange={(event) => setValidDays(event.target.value)}
                required
              />

              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Price (KM)"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={creating || expos.length === 0}>
              <Plus className="mr-2 size-4" />
              {creating ? "Creating..." : "Create ticket type"}
            </Button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing ticket types</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading ticket types...</p>
          ) : visibleTicketTypes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <Tags className="mx-auto mb-4 size-10 text-muted-foreground" />
              <h3 className="font-semibold">No ticket types yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {canManage
                  ? "Create your first ticket type above."
                  : "There are no ticket types available yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleTicketTypes.map((type) => {
                const expo = expos.find((item) => item.id === type.expo_id);
                const isEditing = editingId === type.id;

                return (
                  <div
                    key={type.id}
                    className="space-y-3 rounded-xl border bg-card p-5"
                  >
                    {isEditing ? (
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <Input
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          placeholder="Ticket type name"
                          required
                        />

                        <Select
                          value={editExpo}
                          onValueChange={(value) => setEditExpo(value ?? "")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select exhibition" />
                          </SelectTrigger>
                          <SelectContent>
                            {expos.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.title ?? `Exhibition #${item.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={editDays}
                          onChange={(event) => setEditDays(event.target.value)}
                          placeholder="Validity period (days)"
                          required
                        />

                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editPrice}
                          onChange={(event) => setEditPrice(event.target.value)}
                          placeholder="Price (KM)"
                          required
                        />

                        <div className="flex gap-2">
                          <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{type.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {expo?.title ?? `Exhibition #${type.expo_id}`}
                            </p>
                          </div>
                          <Tags className="size-5 text-primary" />
                        </div>

                        <div className="flex justify-between border-t pt-3 text-sm">
                          <span className="text-muted-foreground">
                            Validity period
                          </span>
                          <span>{type.valid_days_count} days</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-semibold">
                            {Number(type.price).toFixed(2)} KM
                          </span>
                        </div>

                        {canManage && (
                          <div className="flex justify-end gap-2 border-t pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(type)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete ticket type?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{type.name}
                                    "? This action cannot be undone. Ticket
                                    types with existing tickets may not be
                                    deletable.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    disabled={deletingId === type.id}
                                    onClick={() => void handleDelete(type.id)}
                                  >
                                    {deletingId === type.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TicketTypes;
