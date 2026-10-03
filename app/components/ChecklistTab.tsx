"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Compass,
  Home,
} from "lucide-react";
import { JPOTask, TaskCategory } from "@/types/jpo";

interface ChecklistTabProps {
  tasks: JPOTask[];
  onUpdateTask: (task: JPOTask) => void;
  onAddTask: (task: Omit<JPOTask, "id">) => void;
  onDeleteTask: (id: string) => void;
}

export default function ChecklistTab({
  tasks,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
}: ChecklistTabProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("advance_parcoursup");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getCategoryLabel = (cat: TaskCategory) => {
    switch (cat) {
      case "advance_parcoursup":
        return "Admissions & Parcoursup";
      case "prepa":
        return "Prépa Intégrée Aéro";
      case "cycle_ingenieur":
        return "Cycle Ingénieur & Majeures";
      case "assos":
        return "Projets & Associations";
      case "international":
        return "International & Stages";
      case "logement_vie":
        return "Vie à Lyon & Logement";
      case "logistique":
        return "Matériel & Départ";
      default:
        return "Autre";
    }
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch (cat) {
      case "advance_parcoursup":
        return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
      case "prepa":
        return <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case "cycle_ingenieur":
        return <Briefcase className="w-3.5 h-3.5 text-[#00A3E0]" />;
      case "assos":
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
      case "logement_vie":
        return <Home className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterCategory !== "all" && task.category !== filterCategory) return false;
    if (filterStatus === "pending" && task.completed) return false;
    if (filterStatus === "completed" && !task.completed) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    onAddTask({
      question: newQuestion.trim(),
      category: newCategory,
      priority: newPriority,
      completed: false,
      answer: "",
    });

    setNewQuestion("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Overview & Progress Card */}
      <div className="bg-[#0A1326]/90 border border-[#00A3E0]/20 rounded-2xl p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#38BDF8]" />
              Checklist & Questions Stratégiques
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Posez ces questions aux profs et élèves pour blinder votre dossier Parcoursup.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="ipsa-gradient-btn flex items-center justify-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une question</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[#004F9F]/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Progression de vos réponses :</span>
            <span className="font-bold text-[#38BDF8]">
              {completedCount} / {tasks.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#060D1E] rounded-full overflow-hidden p-0.5 border border-[#004F9F]/30">
            <div
              className="h-full bg-gradient-to-r from-[#004F9F] via-[#00A3E0] to-[#38BDF8] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          <div className="flex items-center gap-1 border-r border-[#004F9F]/30 pr-2 shrink-0">
            {(["all", "pending", "completed"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterStatus === st
                    ? "bg-[#004F9F] text-white"
                    : "bg-[#0A1326]/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "all" ? "Toutes" : st === "pending" ? "À poser" : "Faites"}
              </button>
            ))}
          </div>

          {[
            { id: "all", label: "Toutes les catégories" },
            { id: "advance_parcoursup", label: "Parcoursup & Advance" },
            { id: "prepa", label: "Prépa Aéro 1/2" },
            { id: "cycle_ingenieur", label: "Cycle Ingénieur" },
            { id: "assos", label: "Projets & Assos" },
            { id: "logement_vie", label: "Logement & Lyon" },
            { id: "logistique", label: "Matériel" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all border ${
                filterCategory === cat.id
                  ? "bg-[#00A3E0]/15 border-[#00A3E0]/40 text-[#38BDF8] font-semibold"
                  : "bg-[#0A1326]/60 border-[#004F9F]/30 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* New task inline form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-[#0A1326] border border-[#00A3E0]/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#004F9F]/30 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#38BDF8]" />
              Nouvelle question ou point à vérifier
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Annuler
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Votre question ou mémo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Demander le montant moyen des bourses internes..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catégorie
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              >
                <option value="advance_parcoursup">Admissions & Parcoursup</option>
                <option value="prepa">Prépa Intégrée Aéro</option>
                <option value="cycle_ingenieur">Cycle Ingénieur</option>
                <option value="assos">Projets & Associations</option>
                <option value="international">International & Stages</option>
                <option value="logement_vie">Vie à Lyon & Logement</option>
                <option value="logistique">Matériel & Bagages</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priorité
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              >
                <option value="high">Haute (Indispensable)</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse (Secondaire)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="ipsa-gradient-btn text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Ajouter à la liste
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#0A1326]/60 border border-[#004F9F]/20 rounded-2xl p-8 text-center text-slate-400">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Aucune question dans cette vue.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`bg-[#0A1326]/80 border transition-all rounded-2xl p-3.5 sm:p-4 shadow-sm ${
                  task.completed
                    ? "border-emerald-500/20 bg-[#060D1E]/40"
                    : "border-[#004F9F]/25 hover:border-[#00A3E0]/35"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        onUpdateTask({
                          ...task,
                          completed: !task.completed,
                        })
                      }
                      title={task.completed ? "Marquer comme à poser" : "Marquer comme répondue"}
                      className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 hover:text-[#38BDF8]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[#004F9F]/30 text-slate-300 border border-[#004F9F]/30">
                          {getCategoryIcon(task.category)}
                          <span>{getCategoryLabel(task.category)}</span>
                        </span>

                        {task.priority === "high" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Prioritaire
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                          task.completed
                            ? "text-slate-400 line-through decoration-slate-600"
                            : "text-slate-100"
                        }`}
                      >
                        {task.question}
                      </p>

                      {/* Answer input */}
                      <div className="mt-2.5">
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-medium">
                          <MessageSquare className="w-3 h-3 text-[#38BDF8]" />
                          <span>Réponse reçue / Détails retenus :</span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Notez ici la réponse de l'étudiant ou du professeur..."
                          value={task.answer || ""}
                          onChange={(e) =>
                            onUpdateTask({
                              ...task,
                              answer: e.target.value,
                              completed: e.target.value.trim().length > 0 ? true : task.completed,
                            })
                          }
                          className="w-full bg-[#060D1E]/80 border border-[#004F9F]/25 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#00A3E0]/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title="Supprimer cette question"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
