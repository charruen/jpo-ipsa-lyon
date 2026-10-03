"use client";

import React from "react";
import {
  CalendarDays,
  CheckSquare,
  BookOpen,
  FileCheck2,
  Plus,
} from "lucide-react";

export type NavTab = "agenda" | "checklist" | "notes" | "summary";

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onQuickAdd: () => void;
  tasksBadge?: number;
  notesBadge?: number;
}

export default function BottomNav({
  currentTab,
  onChangeTab,
  onQuickAdd,
  tasksBadge,
  notesBadge,
}: BottomNavProps) {
  const tabs = [
    {
      id: "agenda" as NavTab,
      label: "Agenda",
      icon: CalendarDays,
      badge: undefined,
    },
    {
      id: "checklist" as NavTab,
      label: "Checklist",
      icon: CheckSquare,
      badge: tasksBadge,
    },
    {
      id: "notes" as NavTab,
      label: "Carnet",
      icon: BookOpen,
      badge: notesBadge,
    },
    {
      id: "summary" as NavTab,
      label: "Compte Rendu",
      icon: FileCheck2,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Floating Action Button (Smartphone Quick Note / Question) */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-30 sm:hidden">
        <button
          onClick={onQuickAdd}
          title="Ajouter une note ou question rapidement"
          className="flex items-center justify-center w-14 h-14 rounded-full ipsa-gradient-btn text-white shadow-xl shadow-[#00A3E0]/35 border border-[#38BDF8]/60 active:scale-90 transition-transform"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Bottom Sticky Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#060D1E]/95 backdrop-blur-xl border-t border-[#00A3E0]/25 text-slate-400 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? "text-[#38BDF8] font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110 text-[#38BDF8] drop-shadow-[0_0_8px_rgba(0,163,224,0.5)]" : ""
                    }`}
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-4 text-[10px] font-bold rounded-full bg-[#004F9F] text-sky-100 border border-[#00A3E0]/50 flex items-center justify-center shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-[#004F9F] via-[#00A3E0] to-[#38BDF8] rounded-full shadow-[0_0_6px_#00A3E0]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
