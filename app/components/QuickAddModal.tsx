"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Star,
} from "lucide-react";
import { JPONote, JPOTask, JPOEvent } from "@/types/jpo";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (note: Omit<JPONote, "id" | "createdAt">) => void;
  onAddTask: (task: Omit<JPOTask, "id">) => void;
  onAddEvent: (event: Omit<JPOEvent, "id">) => void;
}

export default function QuickAddModal({
  isOpen,
  onClose,
  onAddNote,
  onAddTask,
  onAddEvent,
}: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<"note" | "task" | "event">("note");

  // Quick note fields
  const [standName, setStandName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  // Quick task fields
  const [question, setQuestion] = useState("");

  // Quick event fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("14:00");
  const [eventLocation, setEventLocation] = useState("");

  if (!isOpen) return null;

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standName.trim()) return;

    onAddNote({
      standName: standName.trim(),
      category: "simulateur",
      rating,
      verdict: rating >= 4 ? "coup_de_coeur" : "tres_positif",
      pros: [],
      cons: [],
      content: content.trim(),
      tags: ["JPO", "Lyon"],
    });

    setStandName("");
    setContent("");
    onClose();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    onAddTask({
      question: question.trim(),
      category: "advance_parcoursup",
      priority: "high",
      completed: false,
      answer: "",
    });

    setQuestion("");
    onClose();
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onAddEvent({
      title: eventTitle.trim(),
      category: "labo",
      startTime: eventTime,
      endTime: eventTime,
      location: eventLocation.trim() || "Campus IPSA Lyon",
      description: "",
      status: "upcoming",
      highlight: false,
    });

    setEventTitle("");
    setEventLocation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Saisie Rapide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("note")}
            className={`py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "note"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400"
            }`}
          >
            Avis Stand
          </button>
          <button
            onClick={() => setActiveTab("task")}
            className={`py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "task"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400"
            }`}
          >
            Question
          </button>
          <button
            onClick={() => setActiveTab("event")}
            className={`py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "event"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400"
            }`}
          >
            Horaire
          </button>
        </div>

        {/* Tab 1: Note */}
        {activeTab === "note" && (
          <form onSubmit={handleSubmitNote} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stand ou Labo visité *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Simulateur A320, AeroIPSA, BDE..."
                value={standName}
                onChange={(e) => setStandName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Note rapide
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-300 ml-2">
                  {rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ce que vous en retenez
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Super cockpit, accessible en 1ère année..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              Enregistrer la note
            </button>
          </form>
        )}

        {/* Tab 2: Task */}
        {activeTab === "task" && (
          <form onSubmit={handleSubmitTask} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Question à poser *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Demander le taux de passage en Aéro 2..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              Ajouter à la checklist
            </button>
          </form>
        )}

        {/* Tab 3: Event */}
        {activeTab === "event" && (
          <form onSubmit={handleSubmitEvent} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titre de l&apos;événement *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Conférence Advance..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Heure
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  placeholder="Ex: Amphi A"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              Ajouter à l&apos;agenda
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
