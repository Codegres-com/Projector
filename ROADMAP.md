# Projector Roadmap

This document outlines the strategic plan, architectural decisions, and development phases for **Projector**, an Open Source Project Tracker, Management, SDLC, Delivery, and Communication Software tailored for Remote Async Teams.

## 1. Project Overview
**Projector** aims to solve the unique challenges faced by distributed engineering teams. Unlike traditional project management tools that prioritize synchronous updates and real-time status checks, Projector is built on the philosophy of **Async-First**.

### Core Philosophy
*   **Written-First Culture:** Documentation is not an afterthought; it is the primary mode of communication.
*   **Decision Logging:** Every major technical or product decision is recorded, searchable, and immutable.
*   **Reducing Meetings:** Features are designed to eliminate the need for stand-ups and status meetings through automated reporting and rich context threading.

## 2. Technical Architecture
The project will be built using the **MERN Stack** to ensure a unified JavaScript/TypeScript ecosystem for contributors.

*   **Frontend:** React.js (Single Page Application)
*   **Backend:** Node.js with Express
*   **Database:** MongoDB
*   **State Management & API:** (To be determined by contributors, e.g., Redux, React Query, REST/GraphQL)

## 3. Functional Modules
Projector is divided into four key distinct modules:

### A. Project Tracker & Management
*   **Boards & Lists:** Customizable Kanban and Sprint boards.
*   **Async Standups:** Automated prompt-based status updates integrated into the dashboard.
*   **Milestones:** Date-driven release tracking.

### B. Communication Hub
*   **Contextual Threads:** Discussions attached directly to code, tasks, or documents (avoiding fragmented Slack threads).
*   **Inbox:** A unified notification center for asynchronous updates.
*   **No "Online" Status:** Promoting deep work by removing presence indicators.

### C. Decision Logs (RFCs/ADRs)
*   **Dedicated Module:** A specific section for proposing, debating, and ratifying Architecture Decision Records (ADRs) and Requests for Comments (RFCs).
*   **Voting & Approval:** structured workflows for decision consensus without meetings.

### D. SDLC & Delivery
*   **Git Integration:** Link commits and PRs to tasks (GitHub/GitLab API integration).
*   **CI/CD Visibility:** View build statuses and deployment history directly on the task card.
*   **Release Notes:** Automated generation of release notes based on completed tasks.

## 4. Development Roadmap

### Phase 1: Foundation (MVP)
*   Setup Monorepo structure (MERN).
*   User Authentication & Authorization.
*   Basic CRUD for Tasks and Boards.
*   Initial "Decision Log" implementation.

### Phase 2: Communication & Async Workflow
*   Implement threading system for comments.
*   Build the "Async Standup" feature.
*   Notification system.

### Phase 3: SDLC Integration
*   GitHub/GitLab Webhook integration.
*   Release tracking module.

### Phase 4: Advanced Features
*   Mobile responsive design.
*   Advanced analytics (Lead time, Cycle time).
*   Plugin system for external integrations.

## 5. Contributing
We welcome contributions from the open-source community! Please review the `CONTRIBUTING.md` (coming soon) for guidelines on code style, testing, and pull requests.
