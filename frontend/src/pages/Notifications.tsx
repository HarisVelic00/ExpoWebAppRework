import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Check, Trash2 } from "lucide-react";
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

type Notification = {
  id: number;
  title: string;
  content: string;
  user_id: number;
  creation_date: string;
  is_seen: boolean;
};

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<Notification[]>("/notifications/")
      .then(setNotifications)
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load notifications.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    setUpdatingId(notification.id);

    try {
      const updated = await apiRequest<Notification>(
        `/notifications/${notification.id}`,
        {
          method: "PUT",
          body: {
            title: notification.title,
            content: notification.content,
            is_seen: true,
          },
        },
      );

      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update notification.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      await apiRequest(`/notifications/${id}`, {
        method: "DELETE",
      });

      setNotifications((current) => current.filter((item) => item.id !== id));

      toast.success("Notification deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete notification.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <Bell className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You're all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-start sm:justify-between ${
                  notification.is_seen
                    ? "bg-card"
                    : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="flex gap-3">
                  <Bell
                    className={`mt-1 size-5 shrink-0 ${
                      notification.is_seen
                        ? "text-muted-foreground"
                        : "text-primary"
                    }`}
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>
                      {!notification.is_seen && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {notification.content}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.creation_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!notification.is_seen && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingId === notification.id}
                      onClick={() => void handleMarkAsRead(notification)}
                    >
                      <Check className="mr-2 size-4" />
                      Mark as read
                    </Button>
                  )}

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
                        <AlertDialogTitle>
                          Delete notification?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This notification will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          disabled={deletingId === notification.id}
                          onClick={() => void handleDelete(notification.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
