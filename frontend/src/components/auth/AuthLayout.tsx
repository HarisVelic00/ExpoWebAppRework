import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[40%_60%]">
      <section className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </section>

      <section className="relative hidden min-h-screen lg:block">
        <img
          src="/images/expo-building.jpg"
          alt="Modern exhibition centre illuminated at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="max-w-xl text-4xl font-bold tracking-tight">
            Discover. Connect. Experience.
          </h2>

          <p className="mt-3 max-w-lg text-white/80">
            Your gateway to exhibitions, industry events, and new opportunities.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
