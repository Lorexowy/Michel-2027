"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { hasValidSession } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication only once on mount
    const authenticated = hasValidSession();
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - check only once

  // Show loading only on initial mount
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Ładowanie...</div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show dashboard layout if authenticated
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 w-full lg:ml-64">
        <Topbar />
        <main className="pt-20 sm:pt-24 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
