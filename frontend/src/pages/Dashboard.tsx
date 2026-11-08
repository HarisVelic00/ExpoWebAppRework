import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CalendarDays, Ticket, Wallet, Bell, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type DashboardStats = {
  total_expos: number;
  upcoming_expos: number;
  tickets_sold: number;
  total_revenue: string;
};

type TicketData = {
  id: number;
  expo_id: number;
  date_from: string;
};

type ExpoData = {
  id: number;
};

type NotificationData = {
  id: number;
  is_seen: boolean;
};

type DashboardCard = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      try {
        if (user?.role === "visitor") {
          const [tickets, expos, notifications] = await Promise.all([
            apiRequest<TicketData[]>("/tickets/"),
            apiRequest<ExpoData[]>("/expos/"),
            apiRequest<NotificationData[]>("/notifications/"),
          ]);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcomingExpoIds = new Set(
            tickets
              .filter((ticket) => new Date(ticket.date_from) >= today)
              .map((ticket) => ticket.expo_id),
          );

          setStats([
            {
              title: "My Tickets",
              value: tickets.length.toString(),
              description: "Tickets you have purchased",
              icon: Ticket,
            },
            {
              title: "Upcoming Expos",
              value: upcomingExpoIds.size.toString(),
              description: "Exhibitions you're attending",
              icon: CalendarDays,
            },
            {
              title: "Notifications",
              value: notifications.filter((n) => !n.is_seen).length.toString(),
              description: "Unread notifications",
              icon: Bell,
            },
            {
              title: "Available Expos",
              value: expos.length.toString(),
              description: "Exhibitions to explore",
              icon: Compass,
            },
          ]);
        } else {
          const data = await apiRequest<DashboardStats>("/dashboard/stats");

          setStats([
            {
              title: "Total Expos",
              value: data.total_expos.toString(),
              description: "All exhibitions created",
              icon: CalendarDays,
            },
            {
              title: "Upcoming Expos",
              value: data.upcoming_expos.toString(),
              description: "Scheduled exhibitions",
              icon: CalendarDays,
            },
            {
              title: "Tickets Sold",
              value: data.tickets_sold.toLocaleString(),
              description: "Across all exhibitions",
              icon: Ticket,
            },
            {
              title: "Total Revenue",
              value: `${Number(data.total_revenue).toLocaleString()} KM`,
              description: "Revenue from ticket sales",
              icon: Wallet,
            },
          ]);
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboard();
    }
  }, [user]);

  const isVisitor = user?.role === "visitor";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            {isVisitor
              ? "Here's an overview of your exhibition activity."
              : "Here's what's happening with your exhibitions."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-background p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <Icon className="size-5 text-muted-foreground" />
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold tracking-tight">
                    {loading ? "-" : stat.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
