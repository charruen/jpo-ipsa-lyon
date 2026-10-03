import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  JPOAppState,
  EventCategory,
  EventStatus,
  TaskCategory,
  StandCategory,
  JPONote,
  JPOSummary,
} from "@/types/jpo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("votre-projet")
);

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => isConfigured;

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!supabase) {
    return {
      connected: false,
      message: "Supabase non configuré (clés manquantes ou invalides dans .env.local). Mode Local actif.",
    };
  }

  try {
    const { error } = await supabase.from("jpo_events").select("id").limit(1);
    if (error) {
      return {
        connected: false,
        message: `Erreur Supabase: ${error.message} (Avez-vous exécuté le script SQL ?)`,
      };
    }
    return {
      connected: true,
      message: "Connecté à Supabase avec succès ! Les données sont synchronisées en temps réel.",
    };
  } catch (err: unknown) {
    return {
      connected: false,
      message: `Erreur de connexion: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Fetch all JPO data from Supabase
 */
export async function fetchJPODataFromSupabase(): Promise<Partial<JPOAppState> | null> {
  if (!supabase) return null;

  try {
    const [eventsRes, tasksRes, notesRes, summaryRes] = await Promise.all([
      supabase.from("jpo_events").select("*").order("startTime", { ascending: true }),
      supabase.from("jpo_tasks").select("*").order("created_at", { ascending: true }),
      supabase.from("jpo_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("jpo_summary").select("*").limit(1).maybeSingle(),
    ]);

    if (eventsRes.error || tasksRes.error || notesRes.error) {
      console.warn("Erreur de récupération Supabase:", {
        events: eventsRes.error,
        tasks: tasksRes.error,
        notes: notesRes.error,
      });
      return null;
    }

    const state: Partial<JPOAppState> = {};

    if (eventsRes.data && eventsRes.data.length > 0) {
      state.events = eventsRes.data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        title: String(row.title || ""),
        category: (row.category as EventCategory) || "labo",
        startTime: String(row.startTime || row.start_time || "09:00"),
        endTime: String(row.endTime || row.end_time || "10:00"),
        location: String(row.location || "Campus IPSA Lyon"),
        description: String(row.description || ""),
        status: (row.status as EventStatus) || "upcoming",
        notes: String(row.notes || ""),
        highlight: Boolean(row.highlight),
      }));
    }

    if (tasksRes.data && tasksRes.data.length > 0) {
      state.tasks = tasksRes.data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        category: (row.category as TaskCategory) || "advance_parcoursup",
        question: String(row.question || ""),
        answer: String(row.answer || ""),
        completed: Boolean(row.completed),
        priority: (row.priority as "high" | "medium" | "low") || "medium",
      }));
    }

    if (notesRes.data && notesRes.data.length > 0) {
      state.notes = notesRes.data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        standName: String(row.standName || row.stand_name || ""),
        category: (row.category as StandCategory) || "simulateur",
        contactName: String(row.contactName || row.contact_name || ""),
        contactRole: String(row.contactRole || row.contact_role || ""),
        contactInfo: String(row.contactInfo || row.contact_info || ""),
        rating: Number(row.rating || 5),
        verdict: (row.verdict as JPONote["verdict"]) || "tres_positif",
        pros: Array.isArray(row.pros) ? (row.pros as string[]) : [],
        cons: Array.isArray(row.cons) ? (row.cons as string[]) : [],
        content: String(row.content || ""),
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        photoUrls: Array.isArray(row.photoUrls || row.photo_urls)
          ? ((row.photoUrls || row.photo_urls) as string[])
          : [],
        createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
      }));
    }

    if (summaryRes.data) {
      const s = summaryRes.data as Record<string, unknown>;
      state.summary = {
        candidateName: String(s.candidateName || s.candidate_name || ""),
        jpoDate: String(s.jpoDate || s.jpo_date || ""),
        campus: String(s.campus || "IPSA Lyon"),
        overallRating: Number(s.overallRating || s.overall_rating || 5),
        verdict: (s.verdict as JPOSummary["verdict"]) || "grand_oui",
        topReasons: Array.isArray(s.topReasons || s.top_reasons)
          ? ((s.topReasons || s.top_reasons) as string[])
          : [],
        doubtsOrQuestions: Array.isArray(s.doubtsOrQuestions || s.doubts_or_questions)
          ? ((s.doubtsOrQuestions || s.doubts_or_questions) as string[])
          : [],
        parcoursupDraft: String(s.parcoursupDraft || s.parcoursup_draft || ""),
        familyDebriefDraft: String(s.familyDebriefDraft || s.family_debrief_draft || ""),
        lastGeneratedAt: String(s.lastGeneratedAt || s.last_generated_at || ""),
      };
    }

    return state;
  } catch (err) {
    console.error("fetchJPODataFromSupabase error:", err);
    return null;
  }
}

/**
 * Save complete state to Supabase
 */
export async function syncStateToSupabase(state: JPOAppState): Promise<boolean> {
  if (!supabase) return false;

  try {
    // 1. Sync Events
    if (state.events.length > 0) {
      const formattedEvents = state.events.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        startTime: e.startTime,
        endTime: e.endTime,
        location: e.location,
        description: e.description,
        status: e.status,
        notes: e.notes || "",
        highlight: e.highlight || false,
      }));
      await supabase.from("jpo_events").upsert(formattedEvents);
    }

    // 2. Sync Tasks
    if (state.tasks.length > 0) {
      const formattedTasks = state.tasks.map((t) => ({
        id: t.id,
        category: t.category,
        question: t.question,
        answer: t.answer || "",
        completed: t.completed,
        priority: t.priority,
      }));
      await supabase.from("jpo_tasks").upsert(formattedTasks);
    }

    // 3. Sync Notes
    if (state.notes.length > 0) {
      const formattedNotes = state.notes.map((n) => ({
        id: n.id,
        standName: n.standName,
        category: n.category,
        contactName: n.contactName || "",
        contactRole: n.contactRole || "",
        contactInfo: n.contactInfo || "",
        rating: n.rating,
        verdict: n.verdict,
        pros: n.pros,
        cons: n.cons,
        content: n.content,
        tags: n.tags,
        photoUrls: n.photoUrls || [],
        createdAt: n.createdAt,
      }));
      await supabase.from("jpo_notes").upsert(formattedNotes);
    }

    // 4. Sync Summary
    if (state.summary) {
      const s = state.summary;
      await supabase.from("jpo_summary").upsert({
        id: "main_summary",
        candidateName: s.candidateName,
        jpoDate: s.jpoDate,
        campus: s.campus,
        overallRating: s.overallRating,
        verdict: s.verdict,
        topReasons: s.topReasons,
        doubtsOrQuestions: s.doubtsOrQuestions,
        parcoursupDraft: s.parcoursupDraft,
        familyDebriefDraft: s.familyDebriefDraft,
        lastGeneratedAt: new Date().toISOString(),
      });
    }

    return true;
  } catch (err) {
    console.error("syncStateToSupabase error:", err);
    return false;
  }
}
