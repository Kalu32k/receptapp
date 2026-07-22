# Git Workflow - ReceptApp

## Branch Strategy

Vi använder **Git Flow** workflow.

### Branch Types

#### Main Branches
- `main` - Production code, alltid deploybar
- `develop` - Integration branch för development

#### Support Branches
- `feature/` - Nya features
- `bugfix/` - Bug fixes
- `hotfix/` - Snabba fixes för production
- `docs/` - Dokumentation

---

## Workflow

### 1. Starta Feature

```bash
# Uppdatera develop
git checkout develop
git pull origin develop

# Skapa feature branch
git checkout -b feature/recipe-search
```

#### Naming Convention
```
feature/what-the-feature-does
feature/add-recipe-search
feature/implement-offline-sync
bugfix/fix-typo-in-button
hotfix/fix-critical-api-error
docs/update-readme
```

---

### 2. Implementera Feature

#### Commits
```bash
# Små, logiska commits
git commit -m "feat: add search input component"
git commit -m "feat: implement search service"
git commit -m "feat: connect search to UI"

# Push till GitHub
git push origin feature/recipe-search
```

#### Commit Messages (Conventional Commits)

Format: `<type>(<scope>): <subject>`

Types:
- `feat:` - Ny feature
- `fix:` - Bug fix
- `docs:` - Dokumentation
- `style:` - Formatering (ingen logik)
- `refactor:` - Omstrukturering (ingen logik)
- `perf:` - Performance improve
- `test:` - Test changes
- `chore:` - Andere (deps, build, etc)

Exempel:
```
feat(recipe): add favorite button to recipe card
fix(search): filter by cuisine not working
docs(architecture): update database schema
refactor(components): extract button styles
```

---

### 3. Pull Request

#### Skapa PR på GitHub

**Title**: `[Feature] Add Recipe Search`

**Description**:
```markdown
## Description
Lägger till möjlighet att söka efter recept efter titel.

## Changes
- Ny SearchScreen komponent
- SearchService för filtrering
- Integration med store

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing Done
- [x] Sökning fungerar på engelska
- [x] Sökning fungerar på svenska
- [x] Sara tomma resultat korrekt
- [x] Offline-modo fungerar

## Screenshots
[Om UI-ändringar]
```

#### Checklist före PR
- [ ] Koden är testerad lokalt
- [ ] TypeScript kompilerar utan fel
- [ ] ESLint passar
- [ ] Code reviews self
- [ ] Dokumentation uppdaterad
- [ ] Ingen `console.log` på prod-kod
- [ ] Ingen `any` types
- [ ] Commits är rena & cohesiva

---

### 4. Code Review

#### For Reviewer
- Läs PR description
- Review code changes
- Testa feature lokalt (om möjligt)
- Comment på concerns
- Approve eller request changes

#### För Author
- Svara på comments
- Gör requested changes
- Push ny commit
- Märk conversation som resolved

---

### 5. Merge till Develop

```bash
# GitHub: Merge pull request (Squash or Rebase & Merge)

# Lokalt (efter merge)
git checkout develop
git pull origin develop
git branch -d feature/recipe-search
```

---

### 6. Release till Main

```bash
# Skapa release branch
git checkout -b release/v1.0.0 develop

# Update version i package.json
# Eventuella bug fixes

git commit -m "chore: bump version to 1.0.0"
git push origin release/v1.0.0

# Skapa PR: release/v1.0.0 -> main
# Efter approval & merge:

git checkout main
git pull origin main
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Merge main till develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

---

## Lokalt Workflow

### Uppdatera din branch

```bash
# Hämta latest från develop
git fetch origin
git rebase origin/develop

# Om konflikter, lös dem sedan:
git add .
git rebase --continue
```

### Byta branch

```bash
git checkout feature/my-feature
git status
git log --oneline -5
```

### Ångra ändringar

```bash
# Ångra unstaged changes
git checkout -- <file>

# Ångra senaste commit (keep changes)
git reset --soft HEAD~1

# Ångra senaste commit (discard changes)
git reset --hard HEAD~1
```

---

## CI/CD Pipeline

Varje PR triggrar:

1. ✅ TypeScript compilation
2. ✅ ESLint linting
3. ✅ Unit tests
4. ✅ Integration tests
5. ✅ Build Check

Alla måste passa innan merge är möjligt.

---

## Best Practices

- Små PRs (< 400 lines) är bättre
- En feature per branch
- Frequent commits (varje 15-30 min arbete)
- Push ofta (dagligen minimum)
- Rebase innan merge (keep history clean)
- Delete branch efter merge
- Keep develop deployable
- Tag releases i main

---

## Exempel Session

```bash
# Start
git checkout develop && git pull origin develop

# Create feature branch
git checkout -b feature/add-reviews

# Work & commit
echo "// review code" >> src/components/ReviewCard.tsx
git add .
git commit -m "feat(reviews): add review card component"

# Push
git push origin feature/add-reviews

# (Create PR on GitHub, get approval)

# Merge to develop
git checkout develop && git pull origin develop
git merge --squash feature/add-reviews
git commit -m "feat(reviews): add review functionality"
git push origin develop

# Cleanup
git branch -d feature/add-reviews
git push origin --delete feature/add-reviews
```
