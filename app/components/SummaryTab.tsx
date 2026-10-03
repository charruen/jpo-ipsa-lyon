"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Printer,
  Share2,
  Download,
  Users,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { JPOAppState, JPOSummary } from "@/types/jpo";

interface SummaryTabProps {
  state: JPOAppState;
  onUpdateSummary: (summary: JPOSummary) => void;
}

export default function SummaryTab({ state, onUpdateSummary }: SummaryTabProps) {
  const [activeView, setActiveView] = useState<"parcoursup" | "family" | "print">("parcoursup");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState(state.summary.candidateName || "");
  const [parcoursupLengthMode, setParcoursupLengthMode] = useState<"standard1500" | "detailed">("standard1500");

  const summary = state.summary;

  // Auto-generate helper
  const generateParcoursupText = useCallback((mode: "standard1500" | "detailed") => {
    const highRatedNotes = state.notes.filter((n) => n.rating >= 4);
    const standsList = highRatedNotes.map((n) => n.standName).slice(0, 3).join(", ");
    const contactsMentioned = state.notes
      .filter((n) => n.contactName)
      .map((n) => `${n.contactName} (${n.contactRole || "étudiant"})`)
      .slice(0, 2)
      .join(" et ");

    const keyPros = Array.from(
      new Set(state.notes.flatMap((n) => n.pros))
    ).slice(0, 3);

    if (mode === "standard1500") {
      return `Madame, Monsieur,\n\nPassionné depuis toujours par les sciences appliquées, l'aéronautique et l'exploration spatiale, ma participation à la Journée Portes Ouvertes de l'IPSA sur le campus de Lyon a définitivement conforté mon choix d'intégrer votre cycle préparatoire intégré Aéro 1.\n\nLors de cette visite immersive, j'ai particulièrement apprécié la découverte des équipements de pointe, notamment ${
        standsList || "les simulateurs de vol et la soufflerie aérodynamique"
      }. Les échanges enrichissants avec ${
        contactsMentioned || "les étudiants et les enseignants"
      } m'ont permis de mesurer l'importance accordée à la pratique et aux projets concrets dès la première année (tels que les projets de fusées expérimentales et la conception aéronautique).\n\nRigoureux et motivé, je m'investis pleinement en spécialités scientifiques (Mathématiques et Physique). La pédagogie de l'IPSA, alliant exigence académique, dimension internationale et engagement associatif, correspond exactement à mes aspirations pour devenir un ingénieur audacieux et responsable au service des mobilités de demain.\n\nDéterminé à réussir le Concours Advance et à m'investir sans réserve dans la promotion lyonnaise de l'IPSA, je vous remercie pour l'attention portée à mon dossier.`;
    }

    return `PROJET DE FORMATION MOTIVÉ — ÉCOLE D'INGÉNIEURS IPSA (CAMPUS DE LYON)\n\n1. MOTIVATION & PROJET PROFESSIONNEL :\nMon ambition est de concevoir les technologies de pointe de l'aéronautique, du spatial et des mobilités durables. Le cursus de l'IPSA en 5 ans représente pour moi la voie idéale pour concilier rigueur scientifique et passion appliquée dès le bac.\n\n2. ENSEIGNEMENTS RETENUS LORS DE LA JPO (CAMPUS DE LYON) :\nMa visite au campus de Lyon a transformé mon projet théorique en une conviction concrète. J'ai pu observer :\n- Les infrastructures techniques : ${
      standsList || "les simulateurs de vol d'entraînement, le banc d'essais en soufflerie subsonique et le FabLab"
    }.\n- Les retours d'expérience : les échanges avec ${
      contactsMentioned || "les étudiants et les responsables pédagogiques"
    } m'ont prouvé que les cours théoriques trouvent immédiatement leur application dans les projets associatifs (projets AeroIPSA, robotique, avionique).\n- Points forts observés : ${
      keyPros.length > 0 ? keyPros.join(" ; ") : "Qualité de l'accompagnement pédagogique, taille humaine du campus lyonnais et partenariats industriels."
    }.\n\n3. MON PROFIL & MON ENGAGEMENT :\nMes choix de spécialités scientifiques me confèrent des bases solides en raisonnement et méthode. Je suis prêt à relever le rythme soutenu de la prépa intégrée Aéro 1/2 en m'appuyant sur l'entraide de la promotion et le tutorat.\n\nIntégrer le campus lyonnais de l'IPSA via le Concours Advance est mon vœu de référence sur Parcoursup.`;
  }, [state.notes]);

  const generateFamilyDebriefText = useCallback(() => {
    const avgRating =
      state.notes.length > 0
        ? (
            state.notes.reduce((acc, curr) => acc + curr.rating, 0) /
            state.notes.length
          ).toFixed(1)
        : "5/5";

    const standsVisited = state.notes.map((n) => `• ${n.standName} : note ${n.rating}/5 (${n.verdict})`).join("\n");
    const answeredQuestions = state.tasks
      .filter((t) => t.answer && t.answer.trim().length > 0)
      .map((t) => `• Q: ${t.question}\n  -> R: ${t.answer}`)
      .join("\n\n");

    return `DÉBRIEFING JPO IPSA LYON — POUR LA FAMILLE\nDate : ${summary.jpoDate || "Journée Portes Ouvertes"}\nCampus : IPSA Lyon (11 rue Jean Novel, 7e arr.)\n\n1. RESSENTI GÉNÉRAL & VERDICT :\nNote globale de la visite : ${avgRating}/5\nVerdict : ${
      summary.verdict === "grand_oui"
        ? "EXCELLENT (Grand Oui - École coup de cœur)"
        : "TRÈS POSITIF"
    }\nL'ambiance sur le campus est studieuse mais très stimulante et bienveillante. Le fait que le campus soit à taille humaine à Lyon permet un vrai suivi des profs.\n\n2. CE QUI M'A LE PLUS MARQUÉ :\n${
      standsVisited || "• Visite des simulateurs de vol, de la soufflerie et des assos fusées."
    }\n\n3. RÉPONSES SUR LA SCOLARITÉ & LA LOGISTIQUE :\n${
      answeredQuestions || "• Rythme en prépa : encadré avec des TDs en petits groupes.\n• Logement : quartiers bien desservis par le métro B / tramway T1 (Jean Macé / Saxe).\n• Concours Advance : inscriptions sur Parcoursup, préparation des oraux dès le printemps."
    }\n\n4. CONCLUSION :\nC'est une formation d'ingénieurs très concrète dès la 1ère année, qui me motive énormément.`;
  }, [state.notes, state.tasks, summary.jpoDate, summary.verdict]);

  const handleRegenerateAll = useCallback(() => {
    const newParcoursup = generateParcoursupText(parcoursupLengthMode);
    const newFamily = generateFamilyDebriefText();

    onUpdateSummary({
      ...summary,
      candidateName,
      parcoursupDraft: newParcoursup,
      familyDebriefDraft: newFamily,
      lastGeneratedAt: new Date().toISOString(),
    });
  }, [
    generateParcoursupText,
    generateFamilyDebriefText,
    parcoursupLengthMode,
    candidateName,
    summary,
    onUpdateSummary,
  ]);

  // Generate on first mount if empty
  useEffect(() => {
    if (!summary.parcoursupDraft || !summary.familyDebriefDraft) {
      handleRegenerateAll();
    }
  }, [handleRegenerateAll, summary.familyDebriefDraft, summary.parcoursupDraft]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const shareViaWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const downloadMarkdown = () => {
    const mdContent = `# COMPTE RENDU JPO IPSA LYON\n\n## 1. DOSSIER PARCOURSUP (PROJET DE FORMATION MOTIVÉ)\n\n${summary.parcoursupDraft}\n\n---\n\n## 2. DÉBRIEFING POUR LES PROCHES\n\n${summary.familyDebriefDraft}\n\n---\n\n## 3. FICHE DÉTAILLÉE DES STANDS ET LABOS\n\n${state.notes
      .map(
        (n) => `### ${n.standName} (${n.rating}/5)\n- Verdict: ${n.verdict}\n- Contact: ${n.contactName || "N/A"}\n- Points forts: ${n.pros.join(", ")}\n- Notes: ${n.content}\n`
      )
      .join("\n")}`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JPO-IPSA-Lyon-Compte-Rendu-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="bg-[#0A1326]/90 border border-[#00A3E0]/20 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#38BDF8] animate-pulse" />
              <h2 className="text-lg font-bold text-white">
                Générateur de Compte Rendu & Synthèse
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Générez en un clic vos arguments pour Parcoursup et votre bilan familial à partir de vos notes de la journée.
            </p>
          </div>

          <button
            onClick={handleRegenerateAll}
            className="ipsa-gradient-btn flex items-center justify-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser avec mes notes</span>
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#004F9F]/30 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveView("parcoursup")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeView === "parcoursup"
                ? "bg-[#004F9F] border-[#00A3E0]/50 text-white shadow-md shadow-[#004F9F]/30"
                : "bg-[#0A1326]/80 border-[#004F9F]/30 text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Format Dossier Parcoursup</span>
          </button>

          <button
            onClick={() => setActiveView("family")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeView === "family"
                ? "bg-[#00A3E0]/20 border-[#00A3E0]/50 text-[#38BDF8] shadow-md shadow-[#00A3E0]/15"
                : "bg-[#0A1326]/80 border-[#004F9F]/30 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Format Débrief Famille / Proches</span>
          </button>

          <button
            onClick={() => setActiveView("print")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeView === "print"
                ? "bg-[#38BDF8] border-[#38BDF8] text-[#060D1E] font-bold shadow-md shadow-[#38BDF8]/25"
                : "bg-[#0A1326]/80 border-[#004F9F]/30 text-slate-400 hover:text-white"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Fiche Récap A4 / Impression PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PARCOURSUP DRAFT */}
      {activeView === "parcoursup" && (
        <div className="bg-[#0A1326]/85 border border-[#004F9F]/25 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#004F9F]/30 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                Projet de Formation Motivé — Concours Advance & IPSA
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Texte prêt à coller dans votre espace candidat Parcoursup.
              </p>
            </div>

            {/* Length selector */}
            <div className="flex items-center gap-1 bg-[#060D1E] p-1 rounded-xl border border-[#004F9F]/30 text-xs">
              <button
                onClick={() => {
                  setParcoursupLengthMode("standard1500");
                  onUpdateSummary({
                    ...summary,
                    parcoursupDraft: generateParcoursupText("standard1500"),
                  });
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  parcoursupLengthMode === "standard1500"
                    ? "bg-[#004F9F] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Format 1500 caractères (Officiel)
              </button>
              <button
                onClick={() => {
                  setParcoursupLengthMode("detailed");
                  onUpdateSummary({
                    ...summary,
                    parcoursupDraft: generateParcoursupText("detailed"),
                  });
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  parcoursupLengthMode === "detailed"
                    ? "bg-[#004F9F] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Version Détaillée (Oraux Advance)
              </button>
            </div>
          </div>

          {/* Textarea editor */}
          <div className="space-y-1.5">
            <textarea
              rows={14}
              value={summary.parcoursupDraft}
              onChange={(e) =>
                onUpdateSummary({
                  ...summary,
                  parcoursupDraft: e.target.value,
                })
              }
              className="w-full bg-[#060D1E] border border-[#004F9F]/30 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#00A3E0]/50 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Longueur :{" "}
                <strong
                  className={
                    summary.parcoursupDraft.length > 1500 && parcoursupLengthMode === "standard1500"
                      ? "text-rose-400 font-bold"
                      : "text-[#38BDF8]"
                  }
                >
                  {summary.parcoursupDraft.length}
                </strong>{" "}
                caractères {parcoursupLengthMode === "standard1500" ? "/ 1500 conseillés" : ""}
              </span>
              <span>
                {summary.parcoursupDraft.split(/\s+/).filter(Boolean).length} mots
              </span>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#004F9F]/30">
            <button
              onClick={() =>
                copyToClipboard(summary.parcoursupDraft, "parcoursup")
              }
              className="ipsa-gradient-btn flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              {copiedType === "parcoursup" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le texte pour Parcoursup</span>
                </>
              )}
            </button>

            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 bg-[#0A1326] hover:bg-[#004F9F]/30 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl transition-all border border-[#004F9F]/40"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en Markdown</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: FAMILY DEBRIEF */}
      {activeView === "family" && (
        <div className="bg-[#0A1326]/85 border border-[#004F9F]/25 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#004F9F]/30 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00A3E0]" />
                Débriefing clair pour vos parents & vos proches
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explications simples sur le ressenti, les études, les finances et la vie à Lyon.
              </p>
            </div>
          </div>

          <textarea
            rows={14}
            value={summary.familyDebriefDraft}
            onChange={(e) =>
              onUpdateSummary({
                ...summary,
                familyDebriefDraft: e.target.value,
              })
            }
            className="w-full bg-[#060D1E] border border-[#004F9F]/30 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#00A3E0]/50 leading-relaxed font-sans"
          />

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#004F9F]/30">
            <button
              onClick={() =>
                shareViaWhatsApp(summary.familyDebriefDraft)
              }
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Envoyer par WhatsApp</span>
            </button>

            <button
              onClick={() => copyToClipboard(summary.familyDebriefDraft, "family")}
              className="ipsa-gradient-btn flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              {copiedType === "family" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le débrief</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: PRINTABLE A4 REPORT */}
      {activeView === "print" && (
        <div className="bg-[#0A1326]/85 border border-[#004F9F]/25 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#004F9F]/30 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#38BDF8]" />
                Dossier de Visite Complet A4
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mise en page optimisée pour impression papier ou enregistrement en PDF.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="ipsa-gradient-btn flex items-center gap-1.5 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Sauvegarder en PDF</span>
            </button>
          </div>

          {/* Printable White Sheet Preview */}
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-inner font-sans space-y-6 border border-slate-300">
            {/* Document Header */}
            <div className="border-b-2 border-[#004F9F] pb-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#004F9F] uppercase tracking-widest">
                  COMPTE RENDU OFFICIEL DE VISITE JPO
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
                  IPSA Lyon — École d&apos;Ingénieurs de l&apos;Air et de l&apos;Espace
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Campus de Lyon (11 rue Jean Novel, 69007 Lyon) • Habilitation CTI • Membre CGE
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 shrink-0">
                <p className="font-semibold text-slate-800">
                  {summary.jpoDate || "Journée Portes Ouvertes"}
                </p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span className="text-slate-400">Candidat :</span>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      onUpdateSummary({
                        ...summary,
                        candidateName: e.target.value,
                      });
                    }}
                    className="border-b border-slate-300 text-xs px-1 py-0.5 focus:outline-none focus:border-[#004F9F] w-32"
                  />
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-3 gap-3 text-center bg-slate-100 p-3.5 rounded-lg border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Stands Visités</p>
                <p className="text-xl font-black text-slate-900">{state.notes.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Questions Répondues</p>
                <p className="text-xl font-black text-[#004F9F]">
                  {state.tasks.filter((t) => t.completed).length} / {state.tasks.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Verdict Visite</p>
                <p className="text-xl font-black text-emerald-600">Grand Oui</p>
              </div>
            </div>

            {/* Stands details table */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                Fiches d&apos;Évaluation des Équipements et Ateliers
              </h2>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-700">
                    <th className="py-2 px-2.5 font-bold">Atelier / Équipement</th>
                    <th className="py-2 px-2.5 font-bold">Interlocuteur</th>
                    <th className="py-2 px-2.5 font-bold text-center">Note</th>
                    <th className="py-2 px-2.5 font-bold">Points forts retenus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.notes.map((n) => (
                    <tr key={n.id}>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">{n.standName}</td>
                      <td className="py-2 px-2.5 text-slate-600">
                        {n.contactName ? `${n.contactName} (${n.contactRole || ""})` : "Étudiants"}
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-[#004F9F]">{n.rating}/5</td>
                      <td className="py-2 px-2.5 text-slate-700">
                        {n.pros.length > 0 ? n.pros.join(", ") : n.content.slice(0, 80) + "..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strategic Q&A answers */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                Réponses Clés Recueillies (Scolarité, Admissions, Logement)
              </h2>
              <div className="space-y-2 text-xs">
                {state.tasks
                  .filter((t) => t.answer && t.answer.trim().length > 0)
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <p className="font-bold text-slate-900">• {t.question}</p>
                      <p className="text-slate-700 mt-1 pl-3 border-l-2 border-[#004F9F]">{t.answer}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Parcoursup Text Preview */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                Projet de Formation Motivé Rédigé pour Parcoursup
              </h2>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                {summary.parcoursupDraft}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
