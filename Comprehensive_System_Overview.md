# Mine Safety Companion – Comprehensive System Overview

## 1. Product Vision
Mine Safety Companion (MSC) is a bilingual/multilingual safety orchestration platform that pairs immersive training resources with behavior analytics to actively reduce mining incidents. The app focuses on *habit formation* rather than passive content delivery: every checklist, video, and hazard interaction is tracked, quantified, and surfaced to supervisors so that at-risk workers receive timely coaching.

## 2. User Roles & Responsibilities
| Role | Primary Objectives | Key Screens |
| --- | --- | --- |
| **Worker** | Complete daily safety rituals, watch mandatory training, report hazards, maintain PPE compliance. | Worker Dashboard, Daily Checklist, Hazard Reporting, Video Library, Personal Profile |
| **Supervisor** | Track crew compliance, detect risky behavior, assign corrective actions, acknowledge alerts. | Supervisor Dashboard (behavior analytics, heatmaps, alerts), Hazard Management, Reports |
| **Admin** | Manage users/sites/templates, monitor global health, configure policies. | Admin Dashboard, User Management, Site Settings, Reports, Behavior Overview |
| **DGMS Officer** | Audit compliance, review incidents, ensure regulatory adherence. | Supervisor/Admin dashboards, Reports, Incident Library |

## 3. System Architecture
### Backend (Node/Express)
- **Routes**: `auth`, `checklist`, `videos`, `hazards`, `incidents`, `alerts`, and new `behavior` routes.
- **Middleware**: JWT `protect`, role-based `authorize`.
- **Real-time layer**: Socket.IO initialized in `server.js` (rooms per role for future live alerts).
- **Database**: MongoDB with models for `User`, `Checklist`, `Hazard`, `Video`, `EngagementEvent`, `DailyComplianceSnapshot`, `BehaviorAlert`, etc.

### Frontend (React + Vite)
- **Routing**: `react-router-dom` with a secured `ProtectedRoute` and a `Layout` hosting `Navbar` + `Sidebar`.
- **State**: `AuthContext` (auth, language, behavior hooks) and utility modules (axios, behavior tracker).
- **Styling**: TailwindCSS + custom gradients, Framer Motion for animations, Chart.js for analytics.
- **Localization**: `i18next` with English (default), Telugu, Tamil, Malayalam.

## 4. Feature Breakdown
### Authentication & Profiles
- JWT auth with role + preferred language storage.
- Profile page combines identity, per-role copy, language switcher, compliance score, streaks, and engagement spark-lines.

### Dashboards
- **Worker Dashboard**: actionable cards (checklist, hazards, training, alerts).
- **Supervisor Dashboard**: compliance summary cards, trend charts, top/at-risk lists, zone heatmap, quick actions, behavior alerts table.
- **Admin/DGMS Dashboards**: site-wide stats, reports, user provisioning (existing pages).

### Daily Checklist Workflow
1. Worker opens checklist → `checklist_viewed` event logs with role/date.
2. Each item toggle logs `checklist_item_completed`; PPE-specific items additionally log `ppe_confirmed`/`ppe_skipped`.
3. Submitting all items emits `checklist_completed` plus completion rate and duration.
4. Confetti/toast feedback encourages daily completion streaks.

### Hazard & Incident Management
- Workers capture hazards with severity, location, evidence.
- Supervisors/Admins see tables, statuses, and can escalate/resolved entries.
- Incident library for audits and DGMS reviews.

### Training Video Library
- Filtered gallery with ReactPlayer viewer.
- Telemetry: `video_started`, milestone `video_progress` (25/50/75%), time-based progress, and `video_completed`.
- Future hook: micro-quizzes post playback.

### Behavior Analytics & Nudging
1. **Instrumentation**: Frontend logs events via `logBehaviorEvent`.
2. **Backend processing** (`behaviorController`):
   - Stores raw events (`EngagementEvent`).
   - Aggregates into `DailyComplianceSnapshot` with metrics (checklist rates, PPE, video stats, hazard engagement, quiz averages, login cadence).
   - Computes Safety Compliance Score (weighted mix) and risk level.
   - Maintains streaks and auto-creates `BehaviorAlert`s for low scores or repeated PPE skips.
3. **Supervisor Intelligence**:
   - `/behavior/supervisor/overview` returns summary cards, historical trend, top performers, at-risk list, zone heatmap (aggregated PPE/hazard events per mine zone), and open alerts.
   - Alerts UI allows acknowledge → backend updates status/time.
4. **Worker Insights**:
   - `/behavior/snapshots/me` powers the profile insight card with latest score, risk pill, streak, and recent trend bars.
5. **Future Nudges** (design-ready): use alert metadata to trigger targeted notifications (“Helmet check skipped yesterday”) and positive reinforcement (“5-day safe streak!”).

## 5. Localization Strategy
- `i18n/config.js` defines resource tree (nav, actions, profile copy, role-specific narratives).
- `LanguageSwitcher` updates `AuthContext` preference → backend persists via `/auth/preferences/language`.
- All navigation labels and dropdown actions reference translation keys; Telugu/Tamil/Malayalam copies were authored for nav & profile sections.

## 6. Data Models (Key Fields)
- **User**: `{ name, email, role (worker/supervisor/admin/dgms_officer), preferredLanguage }`.
- **EngagementEvent**: `{ user, type, metadata, occurredAt }`, indexes to allow filtering by user and type.
- **DailyComplianceSnapshot**: `{ user, date (YYYY-MM-DD), metrics{...}, complianceScore, riskLevel, streakCount }`.
- **BehaviorAlert**: `{ user, snapshotDate, type, severity, status, message, metadata }`.

## 7. API Highlights
- `POST /api/behavior/events` – logs worker engagement (auth required).
- `GET /api/behavior/snapshots/me?range=7` – worker self-analytics.
- `GET /api/behavior/supervisor/overview?range=7` – aggregated supervisor view (role: supervisor/admin/dgms).
- `GET /api/behavior/alerts` & `POST /api/behavior/alerts/:id/acknowledge` – manage open alerts.
- Existing endpoints: `/auth/login`, `/auth/register`, `/auth/preferences/language`, `/checklist/:userId`, `/hazards`, `/incidents`, `/videos`, `/alerts`.

## 8. UX Flows
### Worker Daily Flow
1. Login (language auto-applied).
2. Dashboard highlights due checklist & training tasks.
3. Completes checklist (with PPE confirmations) → sees confetti + profile streak update.
4. Watches assigned training videos; telemetry updates compliance score.
5. Uses hazard reporting if issues arise.
6. Visits profile to view compliance score and language settings.

### Supervisor Flow
1. Dashboard summary reveals total workers, average score, high-risk count, inactive users.
2. Trend chart pinpoints days with dips; heatmap highlights dangerous zones.
3. Drills into top vs at-risk lists for coaching priorities.
4. Reviews behavior alerts, acknowledges once actioned.
5. Uses quick links to hazard management, team compliance, and reporting.

### Admin/DGMS Flow
1. Manage user provisioning, roles, and site templates.
2. Review global behavior data through supervisor overview.
3. Export reports and audit logs for regulatory submissions.

## 9. Behavior Change Mechanisms
- **Accountability**: every action (checklist, PPE, video) is logged and scored.
- **Transparency**: workers see their own score/streak; supervisors see comparative lists.
- **Risk Detection**: high PPE skips or low scores auto-generate alerts.
- **Heatmaps**: zone-level aggregations show where compliance deteriorates.
- **Language Personalization**: ensures instructions are understood in native language, reducing miscommunication.

## 10. Mobile & Future Roadmap
1. **React Native/Expo client** sharing the same APIs for offline-friendly worker experiences (camera uploads, push notifications for nudges).
2. **Micro-quizzes** with adaptive reminders feeding directly into snapshots (skill retention).
3. **Predictive models** (logistic regression/RF) to forecast probable violations using accumulated snapshots.
4. **Deeper nudging engine** integrated with FCM or SMS for targeted reminders and positive reinforcement.
5. **Geofencing + IoT** inputs to enrich zone heatmaps with real sensor/RTLS data.

- **Environment Readiness**: Backend validates `CLIENT_URL`, `MONGODB_URI`, and `JWT_SECRET` at boot. Use `backend/config/env.sample` as the template when creating `.env` files.
- **Frontend Config**: Vite expects `VITE_API_URL`; copy `frontend/env.sample` to `.env` for each deployment target.
- **Health + Rate Limits**: `/api/health` reports uptime, and the `/api` namespace is protected by rate limiting to avoid abuse.

---
*This document captures the current architecture, behavior analytics pipeline, role responsibilities, and UX flows, providing a single reference for stakeholders, developers, and evaluators.* 

