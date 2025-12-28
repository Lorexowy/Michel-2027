"use client";

import { useState, FormEvent } from "react";
import { validatePassword, createSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (validatePassword(password)) {
      createSession();
      onSuccess();
    } else {
      setError("Nieprawidłowe hasło. Spróbuj ponownie.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md px-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Michel 2027
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Wprowadź hasło, aby kontynuować
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Zaloguj
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

