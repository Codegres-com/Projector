# Projector Roadmap

This document outlines the strategic plan, architectural decisions, and development phases for **Projector**, an Open Source Project Management, SDLC, Delivery, and Communication Software. It is designed to serve the needs of **Service Agencies** managing multiple client projects from Estimation to Maintenance.

## 1. Project Overview
**Projector** is a comprehensive tool for Service Agencies to manage the entire lifecycle of client projects. It facilitates not just code delivery, but the business processes preceding it (Estimation, Quotation) and the collaboration required to execute it.

### Core Philosophy
*   **Agency-Centric:** Built to handle client requirements, estimation, and billing cycles.
*   **Full Lifecycle Support:** From the first quote to post-deployment maintenance.
*   **Hybrid Communication:** Combines real-time collaboration for speed with written documentation for clarity.

## 2. Technical Architecture
The project will be built using the **MERN Stack**:
*   **Frontend:** React.js
*   **Backend:** Node.js with Express
*   **Database:** MongoDB
*   **Real-time Engine:** Socket.io (for Chat)

## 3. Functional Modules

### A. Pre-Project: Estimation & Quotation
*   **Requirements Gathering:** Tools to document initial client needs.
*   **Estimation Builder:** Create line-item estimates (time/cost) for tasks.
*   **Quotation Generation:** Generate PDF quotes from estimates for client approval.

### B. Project Management & SDLC
The tool supports the full Software Development Life Cycle:
1.  **Planning:** Project initialization, resource allocation.
2.  **Requirements Analysis:** Detailed functional spec documentation.
3.  **Design:** Upload and review wireframes/mockups.
4.  **Development (Implementation):** Task management (Kanban/Sprints) linked to code.
5.  **Testing:** QA bug tracking and test case management.
6.  **Deployment:** Release tracking and CI/CD status.
7.  **Maintenance:** Support ticket handling and SLA tracking.

### C. Team Management
*   **Resource Assignment:** Assign team members to specific projects and tasks.
*   **Roles & Permissions:** Manage access levels (e.g., Admin, Developer, Client, PM).
*   **Availability:** Track team member capacity.

### D. Communication Hub
*   **Real-time Chat:** Integrated team chat (similar to Slack) for quick coordination.
*   **Async Threads:** Contextual discussions on specific tasks or documents to preserve history.
*   **Project Documentation:** Wiki-style documentation for long-term knowledge retention.

## 4. Development Roadmap

### Phase 1: Foundation (MVP)
*   MERN Stack Setup.
*   User & Team Management (Authentication, Roles).
*   Project Creation & Dashboard.

### Phase 2: SDLC & Task Management
*   Kanban Boards & Sprint Planning.
*   Implementation of the 7-step SDLC workflow.
*   Assignment logic (Assigning tasks to members).

### Phase 3: Communication
*   Real-time Chat implementation (Socket.io).
*   Notification system.

### Phase 4: Business Logic (Agency Features)
*   Estimation & Quotation modules.
*   PDF Generation for Quotes.

## 5. Contributing
We welcome contributions! Please review `CONTRIBUTING.md` (coming soon).
