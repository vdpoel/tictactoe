# Copilot Instructions

This repository uses GitHub Copilot guidance files in `.github/`.

## Project

A stateless TicTacToe application with a Java/Spring Boot backend and an Angular frontend in a monorepo.

## Repository Structure

```text
features/                                   # User-written specs and executable BDD features (source of truth)
backend/                                    # Spring Boot application (Gradle)
  src/test/java/com/tictactoe/              # Step definitions and unit tests
frontend/                                   # Angular application
  e2e/step-definitions/                     # Cucumber step definitions
```

## Architecture

### Backend (Strict Layered)

Packages live under `com.tictactoe.*`:

- `web`: Controllers, request/response DTOs, input validation, API contracts
- `application`: Use cases, transaction boundaries, orchestration
- `domain`: Business rules, domain models, domain services, domain exceptions
- `infrastructure`: Persistence, external clients, technical adapters

Dependency rule: `web -> application -> domain`. Infrastructure implements domain ports and depends inward on `domain` only.

### Frontend (Angular)

Feature-based module structure under `frontend/src/app/features/`. Shared utilities go in `frontend/src/app/shared/`.

## Development Workflow (BDD)

1. User writes specs in `features/` — Copilot must not create or edit files in this folder.
2. Root-level `features/*.feature` files are the executable Cucumber input for both backend and frontend.
3. Copilot reads specs and proposes an implementation plan before coding.
4. Backend TDD: write failing tests, implement by layer until green.
5. Frontend BDD: implement step definitions and Angular code.
6. Tests must pass before a feature is considered done.

## Testing

### Frameworks

| Layer    | Framework |
|----------|-----------|
| Backend unit tests  | JUnit 5 + Mockito |
| Backend BDD         | Cucumber (`cucumber-java` + `cucumber-spring`) |
| Frontend unit tests | Vitest via `@angular/build:unit-test` (run with `ng test`) |
| Frontend BDD        | `@cucumber/cucumber` |

### Conventions

**Backend**
- Every new class (service, controller, domain model, etc.) must have a corresponding `*Test.java` in `src/test/java/`.
- Unit tests use `@ExtendWith(MockitoExtension.class)`; do not load the Spring context for unit tests.
- Cucumber step definitions live in `src/test/java/com/tictactoe/` and must not contain business logic.

**Frontend**
- Every new Angular service or component must have a `.spec.ts` file alongside it.
- There is no Zone.js — do not use `fakeAsync` or `tick`.

**General**
- Feature files are the single source of truth for behavior.
- Every feature file has its own dedicated step definitions file — do not mix step definitions from different features in one file.

### Test Commands

```bash
# Backend
cd backend && ./gradlew test
cd backend && ./gradlew cucumberTest
cd backend && ./gradlew test cucumberTest

# Frontend
cd frontend && ng test
cd frontend && npx cucumber-js
```

## Other Commands

```bash
# Backend
cd backend && ./gradlew bootRun
cd backend && ./gradlew build -x test

# Frontend
cd frontend && npm install
cd frontend && ng serve
cd frontend && ng build
```

## Rules & Autonomy

- Backend is stateless: game state is passed by the client on each request.
- Backend capabilities are exposed only through APIs.
- Never create or edit files in `features/`.
- Ask before adding dependencies in `backend/build.gradle.kts` or `frontend/package.json`.
- Running tests and builds autonomously is allowed.

## Java Coding Guidelines

Follow the authoritative Java rules in `.github/instructions/java.instructions.md`.
