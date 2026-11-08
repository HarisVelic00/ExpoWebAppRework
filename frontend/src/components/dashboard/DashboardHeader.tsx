import { Bell, Search, UserRound, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";

type Notification = {
  id: number;
  is_seen: boolean;
};

type Expo = {
  id: number;
  title: string | null;
};

function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [expos, setExpos] = useState<Expo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await apiRequest<Notification[]>("/notifications/");
        setUnreadCount(data.filter((item) => !item.is_seen).length);
      } catch {
        // Keep the current count if the request fails.
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    apiRequest<Expo[]>("/expos/")
      .then(setExpos)
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
      });

      logout();
      toast.success("You have been logged out.");
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed.");
    }
  }

  const filteredExpos = expos.filter((expo) =>
    expo.title?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-8">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your exhibitions and activities.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search exhibitions..."
            className="w-64 pl-9"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />

          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover p-2 shadow-lg">
              {filteredExpos.length > 0 ? (
                filteredExpos.map((expo) => (
                  <button
                    key={expo.id}
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      navigate(`/dashboard/expos/${expo.id}`);
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                  >
                    {expo.title ?? `Exhibition #${expo.id}`}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No exhibitions found.
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/dashboard/notifications")}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 border-l pl-4 outline-none">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{user?.full_name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role ?? "Account"}
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <UserRound />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default DashboardHeader;
