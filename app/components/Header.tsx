"use client";

import React from "react";
import Image from "next/image";
import {
  CloudCheck,
  CloudOff,
  RefreshCw,
  Sparkles,
  Settings as SettingsIcon,
} from "lucide-react";
import { JPOAppState } from "@/types/jpo";

interface HeaderProps {
  state: JPOAppState;
  onOpenSummary: () => void;
  onOpenSettings: () => void;
  syncStatus: "synced" | "syncing" | "offline" | "error";
  onTriggerSync: () => void;
}

export default function Header({
  state,
  onOpenSummary,
  onOpenSettings,
  syncStatus,
  onTriggerSync,
}: HeaderProps) {
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const totalTasks = state.tasks.length;
  const notesCount = state.notes.length;

  return (
    <header className="sticky top-0 z-40 bg-[#060D1E]/92 backdrop-blur-md border-b border-[#00A3E0]/25 text-white transition-all shadow-lg shadow-black/40">
      <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo IPSA */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center h-10 w-14 sm:w-16 rounded-xl bg-white p-1 shadow-md shadow-[#00A3E0]/20 shrink-0 border border-[#00A3E0]/40 overflow-hidden">
            <Image
              src="/ipsa-logo.png"
              alt="Logo IPSA"
              width={64}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A3E0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00A3E0] border border-[#060D1E]"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight truncate bg-gradient-to-r from-white via-sky-100 to-[#38BDF8] bg-clip-text text-transparent">
                IPSA Lyon — Compagnon JPO
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#004F9F]/35 text-[#38BDF8] border border-[#00A3E0]/40 shadow-sm">
                Parcoursup
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
              <span className="text-sky-200/80 font-medium">Campus Lyon (Jean Novel)</span>
              <span>•</span>
              <span className="text-slate-400">
                {completedTasks}/{totalTasks} questions • {notesCount} fiches
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Supabase status indicator */}
          <button
            onClick={onTriggerSync}
            title={
              syncStatus === "synced"
                ? "Synchronisé avec Supabase"
                : syncStatus === "syncing"
                ? "Synchronisation en cours..."
                : "Mode Local / Hors-ligne (Cliquer pour synchroniser)"
            }
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
              syncStatus === "synced"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/25"
                : syncStatus === "syncing"
                ? "bg-[#004F9F]/30 text-[#38BDF8] border-[#00A3E0]/40 animate-pulse"
                : "bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/25"
            }`}
          >
            {syncStatus === "synced" ? (
              <CloudCheck className="w-3.5 h-3.5" />
            ) : syncStatus === "syncing" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline font-medium">
              {syncStatus === "synced"
                ? "Cloud Supabase"
                : syncStatus === "syncing"
                ? "Sync..."
                : "Local"}
            </span>
          </button>

          {/* Quick Summary Generator Button */}
          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 ipsa-gradient-btn text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">Compte Rendu</span>
            <span className="xs:hidden">Bilan</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Paramètres & Accès Campus"
            className="p-2 rounded-xl bg-[#0A1326] hover:bg-[#112140] text-slate-300 hover:text-white border border-[#00A3E0]/25 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
