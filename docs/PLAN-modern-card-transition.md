# PLAN - Modern Card Transition (2026-03-24)

Implement a "modern app" experience where clicking a module card on the Dashboard animates smoothly into the corresponding module page using shared-element transitions.

## Overview
- **Goal**: Create a seamless transition from `Dashboard` cards to `ModulePage` views.
- **Trigger**: Click on an `ActionCard` or `ModuleCard`.
- **Target**: The `ModulePage` header or background.

## UI/UX Goals
- **Motion**: Shared-element (Hero) animation.
- **Stiffness**: 300 (Snappy)
- **Damping**: 30 (Controlled)
- **Experience**: The icon and card background should "grow" into the header of the next page.

## Tech Stack
- **Framework**: React 19 / Vite
- **Animation**: Framer Motion 12+
- **Routing**: React Router DOM 7+

## Proposed File Changes

### Foundation
- **[MODIFY]** `src/components/layout/MainLayout.tsx`:
  - Wrap `<Outlet />` with `AnimatePresence`.
  - Add a `motion.div` wrapper to the content area using `location.pathname` as key.

### Dashboard Layout
- **[MODIFY]** `src/components/ui/ActionCard.tsx`:
  - Add `layoutId` to the main container.
  - Use `motion.div`.
- **[MODIFY]** `src/components/ui/ModuleCard.tsx`:
  - Add `layoutId` to the main container.
- **[MODIFY]** `src/pages/Dashboard.tsx`:
  - Ensure unique `layoutId` for each card (e.g., `card-${title}`).

### Page Transitions
- **[MODIFY]** `src/pages/ModulePage.tsx`:
  - Update the header area to use `layoutId` matching the card click source.
  - Use `useTransition` or simple detection if coming from a card.

## Task Breakdown

### Phase 1: Infrastructure
1. **Task 1: Setup Route Transitions**
   - **Agent**: `frontend-specialist`
   - **Action**: Add `AnimatePresence` and generic fade transition in `MainLayout.tsx`.
   - **Verify**: Pages cross-fade smoothly.

### Phase 2: Shared Elements
2. **Task 2: Card Layout IDs**
   - **Agent**: `frontend-specialist`
   - **Action**: Update `ActionCard` and `ModuleCard` with `motion` and `layoutId`.
3. **Task 3: ModulePage Target ID**
   - **Agent**: `frontend-specialist`
   - **Action**: Assign matching `layoutId` to `ModulePage` header.

### Phase 3: Polish
4. **Task 4: Transition Settings**
   - **Agent**: `frontend-specialist`
   - **Action**: Tune `spring` parameters in `src/config/animations.ts` (if extracted) or locally.

---

## Final Verification (Phase X)
- [x] Lint pass
- [ ] No jarring jumps during "Back" navigation.
- [ ] Card icon expands correctly to the page icon position.
- [ ] Header color transitions seamlessly.
