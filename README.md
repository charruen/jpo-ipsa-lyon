# ✈️ IPSA Lyon — Compagnon JPO & Synthèse Parcoursup

Application web progressive (PWA / Mobile-First) complète conçue pour accompagner votre **Journée Portes Ouvertes (JPO)** sur le campus de l'école d'ingénieurs **IPSA (Lyon 7e)**, consigner toutes vos notes en direct depuis votre smartphone et **générer automatiquement votre compte rendu** pour **Parcoursup** (Projet de formation motivé) et pour vos proches.

Stack : **Next.js 16 (App Router)** • **React 19** • **Tailwind CSS 4** • **Supabase** • **Prêt pour Vercel**

---

## 🎯 Fonctionnalités Clés

### 1. ⏱️ Agenda Dynamique & Gestion des Trajets
- **Planning pré-rempli et personnalisable** de la JPO du campus IPSA Lyon :
  - Trajets en train (Part-Dieu / Jean Macé) & métros/trams TCL (Métro B, Tram T1/T2).
  - Conférence plénière de la Direction (amphi Saint-Exupéry).
  - Visites guidées des laboratoires de pointe (Simulateur de vol A320, Soufflerie subsonique, FabLab).
  - Déjeuner et pause d'échanges avec les élèves ambassadeurs.
  - Village des associations étudiantes (AeroIPSA, IPSA Flight, IPSA Space Systems, BDE).
  - Atelier Admissions & Concours Advance (coefficients, oraux, dossier scolaire).
- **Statuts en 1 clic** : *À venir*, *En cours* (avec indicateur visuel en direct), *Terminé*.
- Prise de notes rapides intégrée directement dans chaque créneau horaire.

### 2. ✅ Checklist & Questions Stratégiques
- **Questions clés pré-remplies** pour ne rien oublier face aux profs et étudiants :
  - **Prépa Intégrée Aéro 1/2** : volume horaire, tutorat, part de projets pratiques.
  - **Cycle Ingénieur & Majeures** : aérospatiale, mobilité durable, systèmes embarqués.
  - **Concours Advance & Parcoursup** : critères du dossier, conseils oraux de motivation.
  - **International** : semestre obligatoire à l'étranger, partenaires.
  - **Vie à Lyon & Logement** : quartiers recommandés (Jean Macé, Gerland), transports.
  - **Matériel indispensable** : bulletins scolaires, pièce d'identité, batterie externe.
- Saisie immédiate de la réponse reçue pendant la discussion.
- Barre de progression dynamique en temps réel.

### 3. 📝 Carnet de Visite par Stand & Atelier
- Évaluation détaillée de chaque stand / simulateur / association :
  - Note de 1 à 5 étoiles & verdict émotionnel (*Coup de cœur 🔥*, *Très positif 👍*, *Mitigé*).
  - Fiche contact de la personne rencontrée (nom, promo, rôle, coordonnées).
  - Points forts marquants et points de vigilance.
  - Notes libres et verbatims.
  - Mots-clés / Tags rapides (#Simulateur, #A320, #CNES, #Fusées, #Advance).

### 4. 📄 Générateur de Compte Rendu Multi-Format
- **Format Dossier Parcoursup (Projet de Formation Motivé)** :
  - Rédige automatiquement un texte argumenté et percutant qui cite les éléments réels de votre journée (simulateurs testés, projets de fusées vus, profs et élèves rencontrés).
  - **Mode officiel 1500 caractères** (calibré pour l'espace Parcoursup) + **Version détaillée** (idéale pour préparer les oraux du Concours Advance).
  - Bouton *Copier en 1 clic*.
- **Format Débrief Famille & Proches** :
  - Synthèse claire et vulgarisée des impressions, de l'ambiance, des coûts de scolarité, du logement et des prochaines échéances.
  - Bouton *Partager directement sur WhatsApp*.
- **Fiche Récap A4 / Impression PDF** :
  - Mise en page sobre et professionnelle optimisée pour impression papier ou export PDF (`window.print()`).
- **Export Markdown (.md)** :
  - Téléchargement du dossier complet sous forme de fichier texte structuré.

### 5. ⚡ Offline-First & Synchronisation Supabase
- **Fonctionne à 100% hors-ligne** grâce au cache `LocalStorage` de votre smartphone (aucun risque de perdre vos notes dans les sous-sols des labos ou dans le train).
- Synchronisation cloud automatique avec **Supabase** dès qu'une connexion internet est disponible.
- Sauvegarde et restauration manuelle de secours via fichier `.json`.

---

## 🚀 Démarrage Rapide

### 1. Lancer l'application en local

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.  
*Astuce : Ouvrez la vue mobile (F12 > Toggle Device Toolbar) pour tester l'interface smartphone.*

---

## 🗄️ Configuration Supabase (Optionnel mais Recommandé)

1. Connectez-vous à votre tableau de bord [Supabase](https://supabase.com).
2. Ouvrez l'éditeur SQL (**SQL Editor**) de votre projet.
3. Copiez l'intégralité du fichier [`supabase/schema.sql`](file:///c:/Users/charruen/site-parcoursup/supabase/schema.sql) et cliquez sur **Run**.
4. Dans le fichier `.env.local` à la racine de ce projet, vérifiez vos clés publiques :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
   ```
5. C'est tout ! L'application synchronisera automatiquement vos événements, questions et notes.

---

## ☁️ Déploiement sur Vercel en 2 minutes

1. Poussez votre code sur GitHub :
   ```bash
   git add .
   git commit -m "feat: IPSA Lyon JPO Companion"
   git push origin main
   ```
2. Rendez-vous sur [Vercel](https://vercel.com), importez ce dépôt GitHub.
3. Ajoutez vos deux variables d'environnement dans les paramètres de déploiement de Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cliquez sur **Deploy** ! Vous aurez votre lien HTTPS accessible depuis votre smartphone pendant toute votre JPO.

---

## 📍 Informations Pratiques Campus IPSA Lyon

- **Adresse :** Campus IONIS Lyon — 11 rue Jean Novel, 69007 Lyon
- **Transports :**
  - **Métro B :** Station Jean Macé ou Place Jean Jaurès (5 min à pied)
  - **Tram T1 / T2 :** Station Centre Berthelot ou Jean Macé
  - **Gares SNCF :** Lyon Part-Dieu (10 min en Métro B) ou Jean Macé (TER direct)
