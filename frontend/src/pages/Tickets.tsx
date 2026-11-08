import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Ticket as TicketIcon, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TicketCard from "@/components/TicketCard";

type Ticket = {
  id: number;
  ticket_type_id: number;
  expo_id: number;
  user_id: number | null;
  date_from: string;
  date_to: string;
  price: string;
  expo_title: string | null;
  ticket_type_name: string;
};

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

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isVisitor = user?.role === "visitor";
  const [deletingTicketId, setDeletingTicketId] = useState<number | null>(null);
  const [expos, setExpos] = useState<Expo[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedExpo, setSelectedExpo] = useState("");
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [creating, setCreating] = useState(false);
  const canManage = user?.role === "organizer" || user?.role === "admin";
  const availableTicketTypes = ticketTypes.filter(
    (type) => String(type.expo_id) === selectedExpo,
  );

  const purchasedTickets = tickets.filter((ticket) => ticket.user_id !== null);

  const manuallyIssuedTickets = tickets.filter(
    (ticket) => ticket.user_id === null,
  );

  useEffect(() => {
    apiRequest<Ticket[]>("/tickets/")
      .then(setTickets)
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load tickets.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (ticketId: number) => {
    setDeletingTicketId(ticketId);
    try {
      await apiRequest(`/tickets/${ticketId}`, { method: "DELETE" });
      setTickets((current) =>
        current.filter((ticket) => ticket.id !== ticketId),
      );

      toast.success("Ticket deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete ticket.",
      );
    } finally {
      setDeletingTicketId(null);
    }
  };

  useEffect(() => {
    if (!canManage) return;

    Promise.all([
      apiRequest<Expo[]>("/expos/"),
      apiRequest<TicketType[]>("/ticket-types/"),
    ])
      .then(([expoData, typeData]) => {
        setExpos(
          user?.role === "organizer"
            ? expoData.filter((expo) => expo.organiser_id === user.id)
            : expoData,
        );
        setTicketTypes(typeData);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load ticket data.",
        );
      });
  }, [user?.id, user?.role]);

  const handleCreate = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedExpo || !selectedTicketType || !dateFrom || !dateTo) {
      toast.error("Please complete all fields.");
      return;
    }

    if (new Date(dateTo) <= new Date(dateFrom)) {
      toast.error("The end date must be after the start date.");
      return;
    }

    setCreating(true);

    try {
      const newTicket = await apiRequest<Ticket>("/tickets/", {
        method: "POST",
        body: {
          expo_id: Number(selectedExpo),
          ticket_type_id: Number(selectedTicketType),
          date_from: new Date(dateFrom).toISOString(),
          date_to: new Date(dateTo).toISOString(),
        },
      });

      setTickets((current) => [newTicket, ...current]);
      setSelectedExpo("");
      setSelectedTicketType("");
      setDateFrom("");
      setDateTo("");
      toast.success("Ticket created successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create ticket",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isVisitor ? "My Tickets" : "Manage Tickets"}
          </h1>
          <p className="text-muted-foreground">
            {isVisitor
              ? "View your purchased tickets."
              : user?.role === "admin"
                ? "View and manage all exhibition tickets."
                : "View and manage tickets for your exhibitions."}
          </p>
        </div>

        {canManage && (
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded-xl border bg-card p-5"
          >
            <div>
              <h2 className="text-lg font-semibold">Create ticket</h2>
              <p className="text-sm text-muted-foreground">
                Manually issue a ticket for an exhibition.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={selectedExpo}
                onValueChange={(value) => {
                  setSelectedExpo(value ?? "");
                  setSelectedTicketType("");
                }}
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

              <Select
                value={selectedTicketType}
                onValueChange={(value) => setSelectedTicketType(value ?? "")}
                disabled={!selectedExpo}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTicketTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name} — {Number(type.price).toFixed(2)} KM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Valid from
                </label>
                <Input
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Valid until
                </label>
                <Input
                  type="datetime-local"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={creating}>
              <Plus className="mr-2 size-4" />
              {creating ? "Creating..." : "Create ticket"}
            </Button>
          </form>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <TicketIcon className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No tickets yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isVisitor
                ? "You haven't purchased any tickets yet."
                : "No tickets have been issued yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {canManage && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Purchased Tickets ({purchasedTickets.length})
                </h2>
                {purchasedTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tickets have been purchased yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {purchasedTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onDelete={handleDelete}
                        deletingTicketId={deletingTicketId}
                        canManage={canManage}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-4">
              {canManage && (
                <h2 className="text-xl font-semibold">
                  Manually Issued Tickets ({manuallyIssuedTickets.length})
                </h2>
              )}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(canManage ? manuallyIssuedTickets : tickets).map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onDelete={handleDelete}
                    deletingTicketId={deletingTicketId}
                    canManage={canManage}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Tickets;
