import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/users/me/change-password", {
        method: "POST",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not change password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account security.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border bg-card p-6"
        >
          <h2 className="text-lg font-semibold">Change password</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Current password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              New password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Changing..." : "Change password"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
