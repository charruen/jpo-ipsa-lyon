"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Train,
  ExternalLink,
  Database,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { JPOAppState } from "@/types/jpo";
import { testSupabaseConnection } from "@/lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: JPOAppState;
  onRestoreState: (newState: JPOAppState) => void;
  onResetToDefault: () => void;
  onTriggerSync: () => void;
  syncStatus: "synced" | "syncing" | "offline" | "error";
}

export default function SettingsModal({
  isOpen,
  onClose,
  state,
  onRestoreState,
  onResetToDefault,
  onTriggerSync,
  syncStatus,
}: SettingsModalProps) {
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setTestResult({
      tested: true,
      connected: res.connected,
      message: res.message,
    });
    setIsTesting(false);
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `IPSA-Lyon-JPO-Backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    downloadAnchor.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.events && parsed.tasks && parsed.notes) {
          onRestoreState(parsed);
          alert("Sauvegarde importée avec succès !");
          onClose();
        } else {
          alert("Format de fichier JSON non reconnu.");
        }
      } catch {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1E]/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0A1326] border border-[#00A3E0]/25 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl shadow-[#004F9F]/20 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#004F9F]/30 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-base font-bold text-white">
              Paramètres & Accès Campus IPSA Lyon
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#004F9F]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Practical Campus Access */}
        <div className="bg-[#060D1E]/70 border border-[#004F9F]/25 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" />
            Accès au Campus de Lyon
          </h3>

          <p className="text-xs font-semibold text-white">
            IPSA Lyon — Campus IONIS
          </p>
          <p className="text-xs text-slate-400">
            11 rue Jean Novel, 69007 Lyon
          </p>

          <div className="pt-2 border-t border-[#004F9F]/20 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>
                <strong className="text-white">Métro B :</strong> Station Jean Macé ou Place Jean Jaurès (5 min à pied)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Tramway T1 / T2 :</strong> Arrêt Centre Berthelot ou Jean Macé
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Gare SNCF :</strong> Lyon Part-Dieu (10 min en métro B) ou Jean Macé (TER direct)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://maps.google.com/?q=11+rue+Jean+Novel+69007+Lyon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A3E0] hover:text-[#38BDF8] transition-colors"
            >
              <span>Ouvrir l&apos;itinéraire sur Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 2. Supabase Cloud Status */}
        <div className="bg-[#060D1E]/70 border border-[#004F9F]/25 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#38BDF8]" />
              Synchronisation Supabase
            </h3>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                syncStatus === "synced"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : syncStatus === "syncing"
                  ? "bg-[#004F9F]/30 text-[#38BDF8]"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {syncStatus === "synced"
                ? "Synchronisé"
                : syncStatus === "syncing"
                ? "Synchronisation..."
                : "Mode Local"}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Vos données sont conservées en local sur votre téléphone et synchronisées avec votre base de données Supabase dès que vous avez du réseau.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 bg-[#0A1326] hover:bg-[#004F9F]/30 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-[#004F9F]/40 transition-colors"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
              )}
              <span>Tester la connexion Supabase</span>
            </button>

            <button
              onClick={onTriggerSync}
              className="ipsa-gradient-btn flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Forcer la synchronisation</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs border ${
                testResult.connected
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-950/30 border-amber-500/30 text-amber-300"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* 3. Backup & Reset */}
        <div className="bg-[#060D1E]/70 border border-[#004F9F]/25 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sauvegarde & Sécurité
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-1.5 bg-[#0A1326] hover:bg-[#004F9F]/30 text-slate-200 font-medium p-2 rounded-xl border border-[#004F9F]/40 transition-colors"
            >
              <Download className="w-4 h-4 text-[#38BDF8]" />
              <span>Exporter mes données (.json)</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 bg-[#0A1326] hover:bg-[#004F9F]/30 text-slate-200 font-medium p-2 rounded-xl border border-[#004F9F]/40 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-[#00A3E0]" />
              <span>Importer un fichier (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-[#004F9F]/20">
            <button
              onClick={() => {
                if (
                  confirm(
                    "Voulez-vous réinitialiser l'application avec les données types de la JPO IPSA Lyon ?"
                  )
                ) {
                  onResetToDefault();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser avec le programme par défaut</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
