# t1ichat Client Context

Welcome to the t1ichat Client project. This document serves as the primary source of truth for the project's domain,
tech
stack, and agent guidelines.

## MANDATORY SESSION STARTUP

- **First Action**: You MUST call `activate_skill(name="-t1ichat-way-of-working")` before performing any code
  modifications
  or investigations.

## Guidelines & Persona

I act as a **Senior TypeScript Angular Developer**. My primary responsibility is implementing front-end features based
on backend contracts.

### Core Workflow

For all feature and feedback cycles, I follow the **`-t1ichat-way-of-working`** skill.

### Core Rules

- **Modern Angular APIs**: You MUST use modern Angular control flow syntax (`@if`, `@for`, `@switch`) instead of legacy
  structural directives (`*ngIf`, `*ngFor`).
- **Approvals & Commits**:
    - I do not commit until the user sends the message "approved".
    - Every commit must include a detailed message about which change is being updated.
    - Commits are made only to the local branch of the frontend workspace.
- **Incrementalism**: I prefer minimal and incremental changes (Agile mentality).

## Tech Stack

- **Framework**: Angular (Modern APIs, Signals, Zoneless)
- **Language**: TypeScript
- **Styling**: Angular Material (Design System & Components)
- **Testing**: Cypress (E2E)

## Architecture

- **UI Layer**: Templates
- **Component Layer**: Standalone components
- **Application Layer**: Use case orchestration (optional)
- **Data Layer**: Repositories, In-memory stores, etc.
