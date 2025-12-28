"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordGate from "@/components/auth/PasswordGate";
import { hasValidSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const authenticated = hasValidSession();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Ładowanie...</div>
      </div>
    );
  }

  // Show password gate if not authenticated
  if (!isAuthenticated) {
    return <PasswordGate onSuccess={handleAuthSuccess} />;
  }

  // If authenticated, this component won't render because (dashboard)/page.tsx takes precedence
  // But we return null as fallback
  return null;
}

