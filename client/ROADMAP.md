# Nexus Client - Feature Roadmap

## Overview
Client-side features needed to integrate with new backend APIs and complete requirements.

---

## 1. Global Search Bar

**Requirement:** §5.13 - Search across multiple entities from a single search bar.

**Backend:** `GET /api/v1/search?q=query` ✅ Ready

**Implementation:**
- Add search input to header/navbar
- Create `SearchResults` component with grouped results (Tasks, Deliverables, Comments, Meeting Logs)
- Add keyboard shortcut (Cmd/Ctrl + K)

**Files to create:**
- `components/search/search-bar.tsx`
- `components/search/search-results.tsx`
- `lib/api/search.ts`

**Effort:** 1 day

---

## 2. Notification Bell & Dropdown

**Requirement:** §5.6 - Alert list for assigned tasks, blockers, or mentions.

**Backend:** `GET /api/v1/notifications` ✅ Ready

**Implementation:**
- Add notification bell icon to header with unread count badge
- Dropdown showing recent notifications
- Mark as read on click
- Link to relevant entity

**Files to create:**
- `components/notifications/notification-bell.tsx`
- `components/notifications/notification-list.tsx`
- `lib/api/notifications.ts`

**Effort:** 1 day

---

## 3. Gantt Chart View

**Requirement:** §5.8 - Timeline comparing Planned vs Actual with delay indicators.

**Backend:** `GET /api/v1/gantt` ✅ Ready (includes `isDelayed`, `delayDays`)

**Implementation:**
- Add Gantt page or tab on Dashboard
- Use library: `frappe-gantt` or `react-gantt-timeline`
- Color-code delayed items (red)
- Show phases, sprints, and tasks hierarchically

**Files to create:**
- `app/(auth)/@team-lead/timeline/page.tsx` (or add to dashboard)
- `components/gantt/gantt-chart.tsx`
- `lib/api/analytics.ts` (add gantt fetch)

**Effort:** 2 days

---

## 4. @Mention Autocomplete

**Requirement:** §5.6 - Notifications for mentions in comments.

**Backend:** Parses @mentions ✅ Ready

**Implementation:**
- Add mention autocomplete to comment input
- Query users endpoint for suggestions
- Insert `@"Full Name"` format on selection

**Files to modify:**
- `components/comments/comment-form.tsx`

**Libraries:** `@tiptap/extension-mention` or custom

**Effort:** 1 day

---

## 5. Blocker Indicators on Dashboard

**Requirement:** §5.6 - Alert for blockers.

**Backend:** Blocker notifications sent to Team Leads ✅ Ready

**Implementation:**
- Show blocked task count on dashboard
- Visual indicator (🚫 icon) on blocked tasks in task lists
- Filter: "Show Blocked Only"

**Files to modify:**
- `app/(auth)/@team-lead/dashboard/page.tsx`
- `components/tasks/task-card.tsx`

**Effort:** 0.5 days

---

## Priority Order

1. **Search Bar** (1 day) - High visibility, uses existing API
2. **Notification Bell** (1 day) - Enables blocker/mention features
3. **Gantt Chart** (2 days) - Key visual requirement
4. **@Mention Autocomplete** (1 day) - UX enhancement
5. **Blocker Indicators** (0.5 days) - Quick win

**Total Estimated Effort:** 5.5 days
