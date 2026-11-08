import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, LockKeyhole, Mail, UserRound, Users } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useAuth, type User } from "@/context/AuthContext";

function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const data = {
        username: formData.get("username") as string,
        full_name: formData.get("full_name") as string,
        company_name: (formData.get("company_name") as string).trim() || null,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as "visitor" | "organizer",
      };

      const response = await apiRequest<{
        user: User;
        message: string;
      }>("/auth/register", {
        method: "POST",
        body: data,
      });

      login(response.user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <p className="text-sm font-semibold tracking-widest text-[#f4511e] uppercase">
        ExpoWebApp
      </p>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>

        <p className="text-muted-foreground">
          Join ExpoWebApp and discover new opportunities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <UserRound className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <div className="relative">
            <UserRound className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company name{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            <Building2 className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="company_name"
              name="company_name"
              type="text"
              placeholder="Enter your company name"
              autoComplete="organization"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Account type</Label>
          <div className="relative">
            <Users className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <select
              id="role"
              name="role"
              defaultValue="visitor"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full 
                rounded-md border py-2 pl-10 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <option value="visitor">Visitor</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#f4511e] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
