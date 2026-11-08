import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, UserRound } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useAuth, type User } from "@/context/AuthContext";

function Login() {
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
        password: formData.get("password") as string,
      };

      await apiRequest<{ message: string }>("/auth/login", {
        method: "POST",
        body: data,
      });

      const user = await apiRequest<User>("/users/me");

      login(user);

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-widest text-[#f4511e] uppercase">
          ExpoWebApp
        </p>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

          <p className="text-muted-foreground">
            Sign in to continue to your account.
          </p>
        </div>
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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#f4511e] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
