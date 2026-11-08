import { Ticket as TicketIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

type Ticket = {
  id: number;
  date_from: string;
  date_to: string;
  price: string;
  expo_title: string | null;
  ticket_type_name: string;
};

type TicketCardProps = {
  ticket: Ticket;
  canManage?: boolean;
  deletingTicketId: number | null;
  onDelete?: (ticketId: number) => void;
};

function TicketCard({
  ticket,
  canManage = false,
  deletingTicketId,
  onDelete,
}: TicketCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b-4 border-primary p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold">
              {ticket.expo_title ?? "Exhibition"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {ticket.ticket_type_name}
            </p>
          </div>
          <TicketIcon className="size-5 text-primary" />
        </div>

        <div className="space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Valid from</span>
            <span>{new Date(ticket.date_from).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Valid until</span>
            <span>{new Date(ticket.date_to).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-lg font-bold">
            {Number(ticket.price).toFixed(2)} KM
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted/40 px-5 py-3">
        <span className="text-xs text-muted-foreground">
          Ticket number #{ticket.id}
        </span>

        {canManage && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              }
            />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ticket #{ticket.id}. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deletingTicketId === ticket.id}
                  onClick={() => onDelete(ticket.id)}
                >
                  {deletingTicketId === ticket.id
                    ? "Deleting..."
                    : "Delete ticket"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export default TicketCard;
