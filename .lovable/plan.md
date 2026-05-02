## Overview

Layer 10 recruiter-friendly features onto the existing app without disrupting current flows. Many primitives already exist (`WhatsAppButton`, `StatusBadge`, `CandidateDetailDrawer`, sonner toasts, daily targets, dashboard stat cards), so most work is composition + small additions. Mobile-first, ≤7-field forms, existing shadcn-ui components only. No schema changes required — we'll reuse `candidate_activities` (`activity_type='contact'`) for "Mark as Contacted" so existing timeline keeps working.

## Features

### 1. WhatsApp click-to-chat with custom template
- Extend `src/components/WhatsAppButton.tsx` with optional `message?: string` prop.
- Default message: `Hi {name}, regarding your profile...` (Nepal +977 prefix already handled).
- Used on candidate cards/rows + Quick View modal.

### 2. Job filters on /jobs
- New `src/components/JobFilters.tsx`: location dropdown (derived from existing `jobs[].location`), shift checkboxes (Day/Night/Rotational), salary range slider (NPR, uses existing `ui/slider`).
- Wire into `src/pages/Jobs.tsx` `filteredJobs` memo. Mobile: collapsed in a `Sheet`; desktop: inline panel.

### 3. Color-coded status badges + last-contact tooltip
- Update `src/components/StatusBadge.tsx`: add subtle leading dot (🟢 Active / 🟡 Interview / 🔵 Placed / ⚪ Inactive) and accept optional `tooltip` content.
- In `Candidates.tsx`, compute lastContactedAt per candidate from `candidate_activities` (latest `contact` or `remark`); pass via shadcn `Tooltip` wrapper.

### 4. Copy Phone button
- Tiny icon button next to phone number on candidate rows and Quick View. Uses `navigator.clipboard.writeText` with sonner success/error toast and 1s "Copied" state.

### 5. Mark as Contacted checkbox
- Checkbox in candidate row. On check → insert `candidate_activities` row with `activity_type='contact'`, `status=candidate.status`, `remarks='Marked as contacted'`. Optimistic UI; toast on failure.
- Display "Contacted {relativeTime}" beside checkbox when latest contact activity exists today.

### 6. WhatsApp message templates
- New `src/components/WhatsAppTemplatesMenu.tsx` — dropdown with 3 preset templates:
  1. Initial outreach
  2. Interview invitation (asks date/place)
  3. Follow-up after interview
- Templates use `{name}` and `{agency}` (from `useAgencySettings`) tokens. Selecting one opens `wa.me/977{phone}?text=...`.
- Mounted inside candidate row and Quick View.

### 7. Candidate Quick View modal
- New lightweight `src/components/CandidateQuickView.tsx` (`Dialog`, mobile-friendly).
- Triggered by clicking candidate name in the table.
- Shows: name, status, top 5 skills, experience years, expected salary (NPR formatted), phone with Copy + WhatsApp + Call + Templates buttons. "Open full profile" link calls existing drawer (keeps the rich `CandidateDetailDrawer` intact).

### 8. Share to WhatsApp Group
- New "Share to WhatsApp" button in the existing bulk actions toolbar (already supports selection in `Candidates.tsx`).
- Formats selected as text:
  ```
  *Available Candidates — {date}*
  1. {name} — {topSkill} — {yrs}y — NPR {salary} — {phone}
  ...
  — {agency_name}
  ```
- Opens `https://wa.me/?text=<encoded>` (lets user pick group/contact). Caps at 30 candidates with toast warning.

### 9. Duplicate Job button
- Add "Duplicate" item to existing job-card `DropdownMenu` in `Jobs.tsx`.
- Opens the create form pre-filled from source job (clears `expires_at`, sets status `Open`, appends ` (Copy)` to `role_title` only if duplicate of same title exists).

### 10. Dashboard metric cards
- Add three `StatCard`s on `Dashboard.tsx`:
  - **Contacted Today** — count of `candidate_activities` where `activity_type='contact'` and `created_at >= today`.
  - **Jobs Filled This Week** — count of `placements` where `placed_date` within current ISO week.
  - **Commission Earned (NPR)** — sum of `commission_amount` for placements in current month (paid + unpaid), formatted via shared NPR helper.
- New hook `src/hooks/useRecruiterMetrics.tsx` to centralize these queries.

## Polish

- **NPR formatter**: add `formatNPR(n)` to `src/lib/utils.ts` → `NPR 25,000`. Replace ad-hoc `NPR ${n.toLocaleString()}` in Dashboard, Jobs, Placements, Quick View, share text.
- **Mobile spacing**: tighten paddings (`p-3 sm:p-4`) on `StatCard`, candidate rows, and Jobs cards; ensure bulk-action toolbar wraps on small screens.
- **Loading states**: convert async buttons (Duplicate Job, Share, Mark Contacted, Templates send) to disabled + spinner using existing `Loader2` pattern.
- **Error toasts**: standardize on sonner `toast.error` for all new actions; keep success toasts subtle.
- **Preserve data & routes**: no route changes, no schema changes, no hook signature changes — only additive props/exports.

## Technical Details

**Files created**
- `src/components/JobFilters.tsx`
- `src/components/CandidateQuickView.tsx`
- `src/components/WhatsAppTemplatesMenu.tsx`
- `src/hooks/useRecruiterMetrics.tsx`

**Files modified**
- `src/components/WhatsAppButton.tsx` — optional `message` prop
- `src/components/StatusBadge.tsx` — color dot + optional tooltip wrapper
- `src/lib/utils.ts` — `formatNPR` helper
- `src/pages/Candidates.tsx` — Quick View trigger, Copy Phone, Mark Contacted, Templates menu, Share-to-WhatsApp bulk action, last-contact tooltip
- `src/pages/Jobs.tsx` — Filters integration, Duplicate menu item
- `src/pages/Dashboard.tsx` — three new metric cards using `useRecruiterMetrics`

**No DB migrations.** Reuses `candidate_activities` (`activity_type='contact'`) and existing `placements`/`transactions` tables. No auth changes (project remains public access per memory).

**Risk control**: each feature is additive and behind its own component, so existing flows (Add candidate, Send for interview, Place, CV generate, Daily Targets, Action Center, Global Search, Quick-Add FAB) are untouched.

## Out of Scope

- LinkedIn sync, SMS gateway, RBAC/auth (excluded per prior phasing decision).
- New tables / migrations.
- Reworking the existing `CandidateDetailDrawer` (Quick View links into it).
