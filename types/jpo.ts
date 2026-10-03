export type EventCategory =
  | "transport"
  | "conference"
  | "labo"
  | "assos"
  | "admissions"
  | "pause"
  | "custom";

export type EventStatus = "upcoming" | "ongoing" | "completed";

export interface JPOEvent {
  id: string;
  title: string;
  category: EventCategory;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  description: string;
  status: EventStatus;
  notes?: string;
  highlight?: boolean;
}

export type TaskCategory =
  | "logistique"
  | "prepa"
  | "cycle_ingenieur"
  | "advance_parcoursup"
  | "assos"
  | "international"
  | "logement_vie"
  | "autre";

export interface JPOTask {
  id: string;
  category: TaskCategory;
  question: string;
  answer?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export type StandCategory =
  | "simulateur"
  | "soufflerie_aerodynamique"
  | "drone_robotique"
  | "fablab"
  | "assos_fusee_spatial"
  | "assos_aero_vol"
  | "bde_vie_etudiante"
  | "prepa_integree"
  | "cycle_ingenieur"
  | "concours_advance"
  | "international"
  | "autre";

export interface JPONote {
  id: string;
  standName: string;
  category: StandCategory;
  contactName?: string;
  contactRole?: string; // ex: "Étudiant 2e année Aéro", "Prof de Physique", "Responsable Admissions"
  contactInfo?: string; // email, insta, linkedin
  rating: number; // 1 à 5 étoiles
  verdict: "coup_de_coeur" | "tres_positif" | "neutre" | "mitige" | "decevant";
  pros: string[];
  cons: string[];
  content: string; // Notes libres
  tags: string[];
  photoUrls?: string[];
  createdAt: string;
}

export interface JPOSummary {
  candidateName: string;
  jpoDate: string;
  campus: string;
  overallRating: number;
  verdict: "grand_oui" | "positif" | "hesitation" | "non";
  topReasons: string[];
  doubtsOrQuestions: string[];
  parcoursupDraft: string;
  familyDebriefDraft: string;
  lastGeneratedAt?: string;
}

export interface JPOAppState {
  events: JPOEvent[];
  tasks: JPOTask[];
  notes: JPONote[];
  summary: JPOSummary;
}
