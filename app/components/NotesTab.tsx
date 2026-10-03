"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Star,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Tag,
  User,
  Sparkles,
  Flame,
  Search,
} from "lucide-react";
import { JPONote, StandCategory } from "@/types/jpo";

interface NotesTabProps {
  notes: JPONote[];
  onAddNote: (note: Omit<JPONote, "id" | "createdAt">) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesTab({
  notes,
  onAddNote,
  onDeleteNote,
}: NotesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [standName, setStandName] = useState("");
  const [category, setCategory] = useState<StandCategory>("simulateur");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [verdict, setVerdict] = useState<JPONote["verdict"]>("coup_de_coeur");
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");

  const getVerdictBadge = (v: JPONote["verdict"]) => {
    switch (v) {
      case "coup_de_coeur":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#004F9F]/30 text-[#38BDF8] border border-[#00A3E0]/40">
            <Flame className="w-3.5 h-3.5 fill-[#38BDF8] text-[#38BDF8]" />
            Coup de Cœur
          </span>
        );
      case "tres_positif":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ThumbsUp className="w-3.5 h-3.5" />
            Très Positif
          </span>
        );
      case "neutre":
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#0A1326] text-slate-300 border border-[#004F9F]/30">
            Neutre
          </span>
        );
      case "mitige":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Mitigé
          </span>
        );
      case "decevant":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-900/30 text-rose-400 border border-rose-800">
            <ThumbsDown className="w-3.5 h-3.5" />
            Décevant
          </span>
        );
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (categoryFilter !== "all" && n.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = n.standName.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchContact = (n.contactName || "").toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchContent && !matchContact && !matchTags) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standName.trim()) return;

    const pros = prosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const cons = consText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onAddNote({
      standName: standName.trim(),
      category,
      contactName: contactName.trim(),
      contactRole: contactRole.trim(),
      contactInfo: contactInfo.trim(),
      rating,
      verdict,
      pros,
      cons,
      content: content.trim(),
      tags,
    });

    // Reset form
    setStandName("");
    setContactName("");
    setContactRole("");
    setContactInfo("");
    setProsText("");
    setConsText("");
    setContent("");
    setTagInput("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Action */}
      <div className="bg-[#0A1326]/90 border border-[#00A3E0]/20 rounded-2xl p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#38BDF8]" />
              Carnet de Visite par Stand & Atelier
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consignez vos impressions sur les simulateurs, la soufflerie, les assos et les profs.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="ipsa-gradient-btn flex items-center justify-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Noter un stand / atelier</span>
          </button>
        </div>

        {/* Search & filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[#004F9F]/30">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, stand, tag ou contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060D1E] border border-[#004F9F]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00A3E0]/50"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#060D1E] border border-[#004F9F]/30 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#00A3E0]/50"
            >
              <option value="all">Tous les types de stands</option>
              <option value="simulateur">Simulateur de vol</option>
              <option value="soufflerie_aerodynamique">Soufflerie aérodynamique</option>
              <option value="assos_fusee_spatial">Fusées & Spatial</option>
              <option value="prepa_integree">Prépa Aéro 1/2</option>
              <option value="concours_advance">Concours Advance & Admissions</option>
              <option value="drone_robotique">Drones & Robotique</option>
              <option value="fablab">FabLab</option>
            </select>
          </div>
        </div>
      </div>

      {/* New Note Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-[#0A1326] border border-[#00A3E0]/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#004F9F]/30 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              Nouvelle fiche d&apos;évaluation de stand
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
                Nom du stand / Atelier / Labo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Simulateur A320 ou Conférence Directeur"
                value={standName}
                onChange={(e) => setStandName(e.target.value)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catégorie de l&apos;atelier
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StandCategory)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              >
                <option value="simulateur">Simulateur de vol</option>
                <option value="soufflerie_aerodynamique">Soufflerie subsonique</option>
                <option value="assos_fusee_spatial">Fusée / Spatial (AeroIPSA)</option>
                <option value="assos_aero_vol">Aviation / Pilotage / BIA</option>
                <option value="drone_robotique">Drones & Robotique autonome</option>
                <option value="fablab">FabLab & Impression 3D</option>
                <option value="prepa_integree">Cycle Prépa Aéro 1/2</option>
                <option value="cycle_ingenieur">Cycle Ingénieur & Majeures</option>
                <option value="concours_advance">Concours Advance & Admissions</option>
                <option value="international">Semestre International</option>
                <option value="bde_vie_etudiante">Vie Étudiante & BDE</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Rating & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#060D1E]/60 p-3 rounded-xl border border-[#004F9F]/25">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Note globale (1 à 5 étoiles)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform active:scale-125"
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
                <span className="text-xs font-semibold text-amber-300 ml-2">
                  {rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Votre ressenti immédiat
              </label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value as JPONote["verdict"])}
                className="w-full bg-[#0A1326] border border-[#004F9F]/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              >
                <option value="coup_de_coeur">🔥 Coup de cœur absolu</option>
                <option value="tres_positif">👍 Très positif & rassurant</option>
                <option value="neutre">😐 Neutre / Classique</option>
                <option value="mitige">🤔 Mitigé / Des doutes</option>
                <option value="decevant">👎 Décevant</option>
              </select>
            </div>
          </div>

          {/* Contact met */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Personne rencontrée
              </label>
              <input
                type="text"
                placeholder="Ex: Thomas ou Dr. Martin"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Son rôle
              </label>
              <input
                type="text"
                placeholder="Ex: Étudiant 2e année Aéro"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact (email, insta...)
              </label>
              <input
                type="text"
                placeholder="Optionnel"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
              />
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-emerald-400 mb-1">
                Points forts marquants (1 par ligne)
              </label>
              <textarea
                rows={2}
                placeholder={`Ex:\nCockpit A320 ultra réaliste\nAccessible dès la prépa`}
                value={prosText}
                onChange={(e) => setProsText(e.target.value)}
                className="w-full bg-[#060D1E] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">
                Points de vigilance / Moins bons (1 par ligne)
              </label>
              <textarea
                rows={2}
                placeholder={`Ex:\nFrais d'inscription élevés\nCharge de travail soutenue`}
                value={consText}
                onChange={(e) => setConsText(e.target.value)}
                className="w-full bg-[#060D1E] border border-amber-500/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes libres, anecdotes, explications reçues
            </label>
            <textarea
              rows={3}
              placeholder="Ex: L'étudiant m'a expliqué que pour le concours Advance, la lettre compte énormément pour faire la différence..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tags clés (séparés par des virgules)
            </label>
            <input
              type="text"
              placeholder="Ex: Simulateur, Aéronautique, CNES, Concours Advance"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-[#060D1E] border border-[#004F9F]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A3E0]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="ipsa-gradient-btn text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Enregistrer la fiche
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3.5">
        {filteredNotes.length === 0 ? (
          <div className="bg-[#0A1326]/60 border border-[#004F9F]/20 rounded-2xl p-8 text-center text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Aucune fiche de stand trouvée.</p>
          </div>
        ) : (
          filteredNotes.map((item) => (
            <div
              key={item.id}
              className="bg-[#0A1326]/85 border border-[#004F9F]/25 hover:border-[#00A3E0]/40 transition-all rounded-2xl p-4 shadow-sm space-y-3"
            >
              {/* Header of the note card */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {getVerdictBadge(item.verdict)}

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            item.rating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {item.standName}
                  </h3>

                  {(item.contactName || item.contactRole) && (
                    <div className="flex items-center gap-1.5 text-xs text-[#38BDF8] mt-1">
                      <User className="w-3.5 h-3.5 text-[#00A3E0]" />
                      <span>
                        {item.contactName}
                        {item.contactRole ? ` (${item.contactRole})` : ""}
                      </span>
                      {item.contactInfo && (
                        <span className="text-slate-400">• {item.contactInfo}</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteNote(item.id)}
                  title="Supprimer cette fiche"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Free notes content */}
              {item.content && (
                <div className="bg-[#060D1E]/60 p-3 rounded-xl border border-[#004F9F]/20 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {item.content}
                </div>
              )}

              {/* Pros & Cons pills */}
              {(item.pros.length > 0 || item.cons.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.pros.length > 0 && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-2.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1.5">
                        <ThumbsUp className="w-3 h-3" /> Ce qui m&apos;a conquis :
                      </span>
                      <ul className="space-y-1">
                        {item.pros.map((pro, pIdx) => (
                          <li key={pIdx} className="text-emerald-200/90 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.cons.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-2.5">
                      <span className="font-semibold text-amber-400 flex items-center gap-1 mb-1.5">
                        <ThumbsDown className="w-3 h-3" /> Vigilance / Doutes :
                      </span>
                      <ul className="space-y-1">
                        {item.cons.map((con, cIdx) => (
                          <li key={cIdx} className="text-amber-200/90 flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#004F9F]/30 text-[#38BDF8] border border-[#00A3E0]/25"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
