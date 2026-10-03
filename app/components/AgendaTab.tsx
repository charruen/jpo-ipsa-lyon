"use client";

import React, { useState } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  PlayCircle,
  Plus,
  Trash2,
  Sparkles,
  Train,
  School,
  Wrench,
  Users,
  GraduationCap,
  Coffee,
} from "lucide-react";
import { JPOEvent, EventCategory, EventStatus } from "@/types/jpo";

interface AgendaTabProps {
  events: JPOEvent[];
  onUpdateEvent: (event: JPOEvent) => void;
  onAddEvent: (event: Omit<JPOEvent, "id">) => void;
  onDeleteEvent: (id: string) => void;
}

export default function AgendaTab({
  events,
  onUpdateEvent,
  onAddEvent,
  onDeleteEvent,
}: AgendaTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);

  // Form states for new event
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("labo");
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [highlight, setHighlight] = useState(false);

  const getCategoryIcon = (cat: EventCategory) => {
    switch (cat) {
      case "transport":
        return <Train className="w-4 h-4 text-emerald-400" />;
      case "conference":
        return <School className="w-4 h-4 text-blue-400" />;
      case "labo":
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case "assos":
        return <Users className="w-4 h-4 text-amber-400" />;
      case "admissions":
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      case "pause":
        return <Coffee className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: EventCategory) => {
    switch (cat) {
      case "transport":
        return "Trajet / Transport";
      case "conference":
        return "Conférence";
      case "labo":
        return "Labo & Simulateur";
      case "assos":
        return "Assos & Projets";
      case "admissions":
        return "Admissions & Concours";
      case "pause":
        return "Pause & Échanges";
      default:
        return "Autre";
    }
  };

  const toggleStatus = (event: JPOEvent) => {
    const nextStatus: Record<EventStatus, EventStatus> = {
      upcoming: "ongoing",
      ongoing: "completed",
      completed: "upcoming",
    };
    onUpdateEvent({
      ...event,
      status: nextStatus[event.status],
    });
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === "all") return true;
    return e.category === selectedCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      category,
      startTime,
      endTime,
      location: location.trim() || "Campus IPSA Lyon",
      description: description.trim(),
      status: "upcoming",
      highlight,
    });

    setTitle("");
    setLocation("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner / Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Programme & Déplacements
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Horaires des conférences, labos, ateliers Advance et trajets TCL / TER.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un créneau</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "Tout le planning" },
            { id: "conference", label: "Conférences" },
            { id: "labo", label: "Simulateurs & Labos" },
            { id: "assos", label: "Associations" },
            { id: "admissions", label: "Admissions" },
            { id: "transport", label: "Trajets" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add form modal / drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Nouveau créneau horaire
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titre de l&apos;événement *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Démo Soufflerie ou Discussion Prépas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="labo">Simulateur & Labo</option>
                <option value="conference">Conférence</option>
                <option value="assos">Assos & Projets</option>
                <option value="admissions">Admissions & Parcoursup</option>
                <option value="transport">Trajet / Déplacement</option>
                <option value="pause">Pause / Déjeuner</option>
                <option value="custom">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Heure début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Heure fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lieu / Salle
              </label>
              <input
                type="text"
                placeholder="Ex: Salle B102, Hall A..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description ou rappel
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Ne pas oublier de demander pour le BIA..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Événement prioritaire (mettre en valeur)</span>
            </label>

            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Timeline items */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Aucun événement dans cette catégorie.</p>
          </div>
        ) : (
          filteredEvents.map((item) => {
            const isCompleted = item.status === "completed";
            const isOngoing = item.status === "ongoing";

            return (
              <div
                key={item.id}
                className={`relative group bg-slate-900/80 border transition-all rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-slate-700 ${
                  isOngoing
                    ? "border-cyan-500 bg-cyan-950/20 shadow-cyan-500/10 shadow-lg ring-1 ring-cyan-500/50"
                    : isCompleted
                    ? "border-slate-800/80 opacity-75 bg-slate-950/40"
                    : item.highlight
                    ? "border-blue-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/20"
                    : "border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Column: Time & Icon */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleStatus(item)}
                      title="Changer le statut (À venir -> En cours -> Terminé)"
                      className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/10" />
                      ) : isOngoing ? (
                        <PlayCircle className="w-6 h-6 text-cyan-400 fill-cyan-500/20 animate-pulse" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.startTime} - {item.endTime}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700">
                          {getCategoryIcon(item.category)}
                          <span className="truncate">{getCategoryLabel(item.category)}</span>
                        </span>

                        {isOngoing && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                            En cours
                          </span>
                        )}

                        {item.highlight && !isCompleted && !isOngoing && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            ★ Incontournable
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isCompleted
                            ? "text-slate-400 line-through decoration-slate-600"
                            : "text-white"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {item.location && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      )}

                      {item.description && (
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                          {item.description}
                        </p>
                      )}

                      {/* Quick inline note input */}
                      <div className="mt-2.5">
                        <input
                          type="text"
                          placeholder="Note rapide sur ce créneau..."
                          value={item.notes || ""}
                          onChange={(e) =>
                            onUpdateEvent({
                              ...item,
                              notes: e.target.value,
                            })
                          }
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDeleteEvent(item.id)}
                      title="Supprimer ce créneau"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
