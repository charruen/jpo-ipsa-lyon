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
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center h-10 w-13 sm:w-16 rounded-xl bg-white p-1 shadow-md shadow-blue-500/20 shrink-0 border border-slate-700/60 overflow-hidden">
            <Image
              src="/ipsa-logo.png"
              alt="Logo IPSA"
              width={64}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight truncate bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                IPSA Lyon — Compagnon JPO
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                Parcoursup
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <span>Campus Lyon (Jean Novel)</span>
              <span>•</span>
              <span className="text-slate-400 font-medium">
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
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              syncStatus === "synced"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : syncStatus === "syncing"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            {syncStatus === "synced" ? (
              <CloudCheck className="w-3.5 h-3.5" />
            ) : syncStatus === "syncing" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
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
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/25 transition-all active:scale-95 border border-blue-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">Compte Rendu</span>
            <span className="xs:hidden">Bilan</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Paramètres & Accès Campus"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
