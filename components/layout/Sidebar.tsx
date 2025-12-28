"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calculator,
  Briefcase,
  Calendar,
  FileText,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/zadania", label: "Zadania", icon: CheckSquare },
  { href: "/goscie", label: "Goście", icon: Users },
  { href: "/kosztorys", label: "Kosztorys", icon: Calculator },
  { href: "/uslugodawcy", label: "Usługodawcy", icon: Briefcase },
  { href: "/harmonogram", label: "Harmonogram", icon: Calendar },
  { href: "/notatki", label: "Notatki", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-2xl",
          "w-64 border-r border-slate-700/50",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <Link 
            href="/dashboard" 
            onClick={closeSidebar}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-white/10 group-hover:bg-white/20 rounded-xl transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Michel 2027</h2>
              <p className="text-xs text-slate-400 font-medium">Planowanie ślubu</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-white/5"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon className={cn(
                    "w-4 h-4 transition-transform",
                    isActive && "scale-110"
                  )} />
                </div>
                
                <span className={cn(
                  "font-medium text-sm transition-colors",
                  isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 py-2 text-xs text-slate-400 text-center">
            <p>© 2027 Michel</p>
          </div>
        </div>
      </aside>
    </>
  );
}
