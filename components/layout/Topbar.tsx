"use client";

import { useEffect, useState } from "react";
import { clearSession, getSessionTimestamp, createSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, Clock } from "lucide-react";

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minut
const WARNING_TIME_MS = 1 * 60 * 1000; // 1 minuta przed końcem

export default function Topbar() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_DURATION_MS);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const sessionTimestamp = getSessionTimestamp();
    if (!sessionTimestamp) {
      // Jeśli nie ma timestamp, ustawiamy aktualny czas
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - sessionTimestamp;
      const remaining = SESSION_DURATION_MS - elapsed;

      if (remaining <= 0) {
        // Sesja wygasła - automatyczne wylogowanie
        if (!isLoggingOut) {
          setIsLoggingOut(true);
          handleAutoLogout();
        }
        return;
      }

      setTimeRemaining(remaining);

      // Pokaż dialog ostrzegawczy na 1 minutę przed końcem
      if (remaining <= WARNING_TIME_MS && !showWarningDialog && remaining > 0) {
        setShowWarningDialog(true);
      }
    };

    // Aktualizuj timer co sekundę
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Wywołaj od razu

    return () => clearInterval(interval);
  }, [showWarningDialog, isLoggingOut]);

  const handleAutoLogout = () => {
    clearSession();
    router.push("/");
    router.refresh();
  };

  const handleLogout = () => {
    clearSession();
    router.push("/");
    router.refresh();
  };

  const handleExtendSession = () => {
    // Resetuj timestamp sesji
    createSession();
    setShowWarningDialog(false);
    setTimeRemaining(SESSION_DURATION_MS);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (): string => {
    if (timeRemaining <= WARNING_TIME_MS) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-slate-600 dark:text-slate-400";
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
            Michel 2027
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <Clock className={`w-4 h-4 ${getTimeColor()}`} />
            <span className={`text-sm font-mono font-semibold ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Wyloguj</span>
          </Button>
        </div>
      </header>

      {/* Warning Dialog */}
      <AlertDialog 
        open={showWarningDialog} 
        onOpenChange={(open) => {
          // Nie pozwól zamknąć dialogu przez kliknięcie poza nim lub ESC
          // Dialog może być zamknięty tylko przez wybór opcji
          if (!open && timeRemaining > 0) {
            // Jeśli użytkownik próbuje zamknąć dialog (ESC lub kliknięcie poza nim),
            // traktujemy to jako wybór "Wyloguj"
            handleAutoLogout();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy chcesz dalej pracować?</AlertDialogTitle>
            <AlertDialogDescription>
              Twoja sesja wygaśnie za {formatTime(timeRemaining)}. Kliknij "Tak, przedłuż sesję", aby kontynuować pracę.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAutoLogout}>
              Wyloguj
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleExtendSession}>
              Tak, przedłuż sesję
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
