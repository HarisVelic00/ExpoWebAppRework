import { NavLink } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Ticket,
  Bell,
  Users,
  Tags,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigationItems = {
  visitor: [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Expos", path: "/dashboard/expos", icon: CalendarDays },
    { title: "My Tickets", path: "/dashboard/tickets", icon: Ticket },
    { title: "Notifications", path: "/dashboard/notifications", icon: Bell },
  ],
  organizer: [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Expos", path: "/dashboard/expos", icon: CalendarDays },
    {
      title: "Create Expo",
      path: "/dashboard/expos/create",
      icon: PlusCircle,
    },
    { title: "My Tickets", path: "/dashboard/tickets", icon: Ticket },
    { title: "Ticket Types", path: "/dashboard/ticket-types", icon: Tags },
    { title: "Notifications", path: "/dashboard/notifications", icon: Bell },
  ],
  admin: [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Expos", path: "/dashboard/expos", icon: CalendarDays },
    { title: "Users", path: "/dashboard/users", icon: Users },
    { title: "Tickets", path: "/dashboard/tickets", icon: Ticket },
    { title: "Ticket Types", path: "/dashboard/ticket-types", icon: Tags },
    { title: "Notifications", path: "/dashboard/notifications", icon: Bell },
  ],
};

function DashboardSidebar() {
  const { user } = useAuth();

  const items =
    navigationItems[user?.role as keyof typeof navigationItems] ??
    navigationItems.visitor;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold tracking-tight">
          Expo<span className="text-[#f4511e]">Web</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="size-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">ExpoWebApp © 2026</p>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
