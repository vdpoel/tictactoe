# Copilot Instructions

This repository uses GitHub Copilot guidance files in `.github/`.

## Project

A stateless TicTacToe application with a Java/Spring Boot backend and an Angular frontend in a monorepo.

## Repository Structure

```text
features/                                   # User-written specs and executable BDD features (source of truth)
  TODO/                                     # Backlog features not yet active
backend/                                    # Spring Boot application (Gradle)
  src/test/java/com/tictactoe/              # Step definitions and unit tests
frontend/                                   # Angular application
  e2e/step-definitions/                     # Cucumber step definitions
```

## Commands

### Backend

```bash
cd backend && ./gradlew test
cd backend && ./gradlew cucumberTest
cd backend && ./gradlew test cucumberTest
cd backend && ./gradlew bootRun
cd backend && ./gradlew build -x test
```

### Frontend

```bash
cd frontend && npm install
cd frontend && ng serve
cd frontend && ng test
cd frontend && npx cucumber-js
cd frontend && ng build
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

1. User writes specs in `features/` (Copilot must not create or edit files in this folder).
2. Root-level `features/*.feature` files are also the executable Cucumber input for backend and frontend.
3. Copilot reads specs and proposes an implementation plan before coding.
4. Backend TDD: failing tests, implementation by layer until green.
5. Frontend BDD: step definitions and Angular implementation.
6. Tests must pass before a feature is done.

## Autonomy

- Ask before adding dependencies in `backend/build.gradle.kts` or `frontend/package.json`.
- Never create or edit files in `features/`.
- Running tests/builds autonomously is allowed.

## Java Coding Guidelines

Follow the authoritative Java rules in `.github/instructions/java.instructions.md`.

## Key Conventions

- Backend is stateless: game state is passed by the client on each request.
- Backend capabilities are exposed only through APIs.
- Feature files are the single source of truth for behavior.
- Backend tests use JUnit 5 + Mockito and Cucumber (`cucumber-java` + `cucumber-spring`).
- Frontend BDD uses `@cucumber/cucumber`.
