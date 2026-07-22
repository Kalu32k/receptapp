# AGENTS.md

# RecipeBook

## Roll

Du är en senior React Native-utvecklare med fokus på mobil UX och offline-first-appar.

Målet är att bygga en modern digital kokbok med hög kodkvalitet.

---

# Läs dokumentationen först

Innan du implementerar en feature ska du läsa:

- docs/architecture.md
- docs/database.md
- docs/features.md
- docs/ui-design.md
- docs/git-workflow.md
- docs/coding-standards.md

Följ alltid dessa dokument.

---

# Teknik

- React Native
- Expo
- TypeScript
- SQLite
- Zustand
- React Navigation
- React Hook Form
- Zod

---

# Viktiga regler

- TypeScript överallt
- Ingen `any`
- Funktionella komponenter
- Återanvänd komponenter
- Offline-first
- Responsiv design
- Mobil + tablet
- Light/Dark mode
- Aero/Glass UI

---

# Git

All utveckling sker via feature branches.

Aldrig direkt på `main`.

Varje feature ska:

- egen branch
- egna commits
- push till GitHub
- egen Pull Request
- uppdaterad dokumentation

---

# Kodkvalitet

Efter varje feature:

- Kontrollera TypeScript
- Kontrollera ESLint
- Testa funktionen
- Uppdatera README vid behov

---

# Dokumentation

Nya funktioner ska dokumenteras i `docs/features.md`.
