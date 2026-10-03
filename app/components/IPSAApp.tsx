"use client";

import React, { useState, useEffect, useCallback } from "react";
import { JPOAppState, JPOEvent, JPOTask, JPONote, JPOSummary } from "@/types/jpo";
import { DEFAULT_JPO_DATA } from "@/data/defaultJpoData";
import {
  fetchJPODataFromSupabase,
  syncStateToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";
import Header from "./Header";
import BottomNav, { NavTab } from "./BottomNav";
import AgendaTab from "./AgendaTab";
import ChecklistTab from "./ChecklistTab";
import NotesTab from "./NotesTab";
import SummaryTab from "./SummaryTab";
import SettingsModal from "./SettingsModal";
import QuickAddModal from "./QuickAddModal";

const LOCAL_STORAGE_KEY = "ipsa_lyon_jpo_state_v1";

export default function IPSAApp() {
  const [state, setState] = useState<JPOAppState>(DEFAULT_JPO_DATA);
  const [currentTab, setCurrentTab] = useState<NavTab>("agenda");
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline" | "error">(
    "offline"
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // 1. Initial Load: load cache and check Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.events && parsed.tasks && parsed.notes) {
            setState(parsed);
          }
        }
      } catch (e) {
        console.warn("Could not load from localStorage:", e);
      }

      if (isSupabaseConfigured()) {
        setSyncStatus("syncing");
        fetchJPODataFromSupabase()
          .then((remoteData) => {
            if (remoteData && (remoteData.events || remoteData.notes)) {
              setState((prev) => ({
                ...prev,
                ...remoteData,
              }));
              setSyncStatus("synced");
            } else {
              setSyncStatus("offline");
            }
          })
          .catch(() => {
            setSyncStatus("offline");
          });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. Persist to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [state]);

  // 3. Sync to Supabase helper
  const handleTriggerSync = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSyncStatus("offline");
      return;
    }
    setSyncStatus("syncing");
    const success = await syncStateToSupabase(state);
    setSyncStatus(success ? "synced" : "error");
  }, [state]);

  // Event Handlers
  const handleAddEvent = (eventData: Omit<JPOEvent, "id">) => {
    const newEvent: JPOEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      events: [...prev.events, newEvent].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    }));
  };

  const handleUpdateEvent = (updated: JPOEvent) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === updated.id ? updated : e)),
    }));
  };

  const handleDeleteEvent = (id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  // Task Handlers
  const handleAddTask = (taskData: Omit<JPOTask, "id">) => {
    const newTask: JPOTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (updated: JPOTask) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // Note Handlers
  const handleAddNote = (noteData: Omit<JPONote, "id" | "createdAt">) => {
    const newNote: JPONote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const handleDeleteNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  // Summary Handler
  const handleUpdateSummary = (summary: JPOSummary) => {
    setState((prev) => ({
      ...prev,
      summary,
    }));
  };

  const handleResetToDefault = () => {
    setState(DEFAULT_JPO_DATA);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_JPO_DATA));
    } catch {}
  };

  const handleRestoreState = (newState: JPOAppState) => {
    setState(newState);
  };

  const pendingTasksCount = state.tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        state={state}
        onOpenSummary={() => setCurrentTab("summary")}
        onOpenSettings={() => setIsSettingsOpen(true)}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4">
        {currentTab === "agenda" && (
          <AgendaTab
            events={state.events}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentTab === "checklist" && (
          <ChecklistTab
            tasks={state.tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === "notes" && (
          <NotesTab
            notes={state.notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {currentTab === "summary" && (
          <SummaryTab
            state={state}
            onUpdateSummary={handleUpdateSummary}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onQuickAdd={() => setIsQuickAddOpen(true)}
        tasksBadge={pendingTasksCount}
        notesBadge={state.notes.length}
      />

      {/* Settings & Campus Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onRestoreState={handleRestoreState}
        onResetToDefault={handleResetToDefault}
        onTriggerSync={handleTriggerSync}
        syncStatus={syncStatus}
      />

      {/* Quick Add Bottom Sheet */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddNote={handleAddNote}
        onAddTask={handleAddTask}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
}
