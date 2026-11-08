import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ProfileData = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  company_name: string | null;
  about_us: string | null;
};

function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<ProfileData>("/users/me")
      .then((data) => {
        setProfile(data);
        setFullName(data.full_name);
        setEmail(data.email);
        setCompanyName(data.company_name ?? "");
        setAboutUs(data.about_us ?? "");
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load profile.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const updated = await apiRequest<ProfileData>(`/users/${profile.id}`, {
        method: "PUT",
        body: {
          full_name: fullName.trim(),
          email: email.trim(),
          company_name: companyName.trim() || null,
          about_us: aboutUs.trim() || null,
        },
      });

      setProfile(updated);

      updateUser({
        full_name: updated.full_name,
        email: updated.email,
      });

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading profile...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border bg-card p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">Username</label>
              <Input value={profile?.username ?? ""} disabled />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Company name
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={200}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">About</label>
              <Textarea
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                maxLength={2000}
                rows={5}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Account role: <span className="capitalize">{profile?.role}</span>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Profile;
