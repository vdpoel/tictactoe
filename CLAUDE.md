# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A stateless TicTacToe application with a Java/Spring Boot backend and an Angular frontend in a monorepo.

## Repository Structure

```
features/                                   # User-written specs (read-only for Claude)
backend/                                    # Spring Boot application (Gradle)
  src/test/resources/features/             # Executable Cucumber features — written by Claude
  src/test/java/com/tictactoe/            # Step definitions and unit tests
frontend/                                   # Angular application
  e2e/features/                            # Executable Cucumber features — written by Claude
  e2e/step-definitions/                    # Cucumber step definitions
```

## Commands

### Backend

```bash
# Run unit tests only
cd backend && ./gradlew test

# Run Cucumber BDD tests only
cd backend && ./gradlew cucumberTest

# Run all tests (unit + Cucumber)
cd backend && ./gradlew test cucumberTest

# Run the application
cd backend && ./gradlew bootRun

# Build (skip tests)
cd backend && ./gradlew build -x test
```

### Frontend

```bash
# Install dependencies
cd frontend && npm install

# Run dev server
cd frontend && ng serve

# Run unit tests
cd frontend && ng test

# Run Cucumber BDD tests
cd frontend && npx cucumber-js

# Build
cd frontend && ng build
```

## Architecture

### Backend — Strict Layered Architecture

Packages live under `com.tictactoe.*`:

| Layer | Package | Responsibility |
|---|---|---|
| `web` | `web` | Controllers, request/response DTOs, input validation, API contracts |
| `application` | `application` | Use cases, transaction boundaries, orchestration |
| `domain` | `domain` | Business rules, domain models, domain services, domain exceptions |
| `infrastructure` | `infrastructure` | Persistence, external clients, technical adapters |

**Dependency rule: `web → application → domain`. Infrastructure implements domain interfaces (ports) and depends inward on `domain` only. No layer may skip a level or depend outward.**

- Domain defines interfaces (ports); infrastructure provides implementations (adapters).
- Application layer orchestrates domain objects and owns transaction boundaries.
- Web layer never contains business logic — only maps HTTP ↔ application commands/queries.

### Frontend — Angular

Feature-based module structure under `src/app/features/`. Each feature has its own components, services, and routing. Shared utilities go in `src/app/shared/`.

BDD step definitions live alongside feature files in `frontend/e2e/`.

## Deployment

The application is containerised with Docker:

- `backend/Dockerfile` — multi-stage build: Gradle build → slim JRE runtime image.
- `frontend/Dockerfile` — multi-stage build: `ng build` → Nginx to serve static assets.
- `docker-compose.yml` (repo root) — orchestrates both containers together.

```bash
# Build and run the full stack
docker compose up --build

# Backend only
docker compose up backend

# Frontend only
docker compose up frontend
```

## Development Workflow (Vibecoding with BDD)

1. **User writes a spec file** in `features/` in the following format — Claude may not create or edit these files:
   ```gherkin
   Feature: <title>

     As a <...>,
     I want <...>,
     so that <...>.

     Scenario: <title>
       Given ...
       When ...
       Then ...
   ```
   Each file contains one or more user stories, each followed by one or more Gherkin scenarios.
2. **Plan** — Claude reads the spec, then produces an implementation plan covering:
   - Which layers are affected (web / application / domain / infrastructure)
   - New or modified classes, interfaces, and endpoints
   - Executable Cucumber scenarios Claude will write (in `backend/src/test/resources/features/` and `frontend/e2e/features/`)
   - Test strategy (which units to test, which scenarios map to Cucumber steps)
   - Any dependencies required (listed for user approval before proceeding)

   Claude presents the plan and waits for user confirmation before continuing.
3. **Backend TDD** — Claude writes executable `.feature` files in `backend/src/test/resources/features/`, then failing unit tests, then implements code layer by layer (domain → application → web) until tests pass. Step definitions live in `src/test/java/com/tictactoe/`.
4. **Frontend BDD** — Claude writes executable `.feature` files in `frontend/e2e/features/`, then Cucumber.js step definitions, then Angular component code.
5. **Tests must pass** before any feature is considered done.

## Autonomy

- **Always ask before adding any dependency** (backend or frontend) — do not add to `build.gradle.kts` or `package.json` without confirmation.
- **Never create or edit files in `features/`** — these are the user's specs. Claude reads them to produce executable tests elsewhere.
- Running tests and builds can be done autonomously without asking.

## Java Coding Guidelines

All Java code must follow the rules in [java.instructions.md](java.instructions.md). Key points:

- **Naming:** `PascalCase` classes, `camelCase` methods/variables, `UPPER_SNAKE_CASE` constants, lowercase packages.
- **Layout:** 4-space indentation, max 120 characters per line.
- **Classes:** Prefer records for data holders, immutable classes where possible, program to interfaces.
- **Enums** over string/int constants.
- **Exceptions:** Catch specific types only; never swallow exceptions silently.
- **Optional:** Use for return types that may be absent; never for fields or parameters.
- **Collections:** Return empty collections (not `null`), use `isEmpty()`, prefer `for-each`, use diamond operator.
- **Streams:** No side effects in `map`/`filter`; prefer method references over lambdas.
- **Concurrency:** Use `java.util.concurrent` utilities; avoid raw `Thread` and misuse of `volatile`.
- **Date/Time:** Use `java.time.*` exclusively — no `java.util.Date` or `Calendar`.
- **Strings:** Use text blocks (`"""`) for multi-line string literals.

## Key Conventions

- The backend is **stateless** — no server-side session. Game state is passed by the client on each request.
- Backend capabilities must be exposed through APIs only — no direct coupling between backend and frontend.
- Feature files are the **single source of truth** for behavior. Code must match them, not the other way around.
- Unit tests use **JUnit 5 + Mockito** on the backend.
- Cucumber on the backend uses **cucumber-java** + **cucumber-spring**.
- Cucumber on the frontend uses **@cucumber/cucumber** with Angular's testing utilities.
