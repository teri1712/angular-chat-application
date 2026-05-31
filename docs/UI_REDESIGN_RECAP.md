# Nexa Client UI Redesign Recap

This document summarizes the changes made to transition the Nexa Client UI to the **Exaggerated Minimalism** design system.

## 1. Design Tokens & Fundamentals
- Updated `src/assets/design-tokens.css` with semantic tokens for Colors, Spacing, Shadows, and Border Radius.
- Implemented **Exaggerated Minimalism** tokens:
    - Primary: `#2563EB` (Blue 600)
    - Background: `#FFFFFF` (Light) / `#020617` (Dark)
    - Spacing Scale: 4px increments (xs to 3xl)
    - Radius Scale: `xs` (2px) to `full` (9999px), with `xl` (16px) for bubbles.

## 2. Message Components Redesign
- **General Architecture**: Transitioned to a "bubble-frame" logic where message groups share a cohesive look.
- **Left Message**:
    - Avatar resized to 28px.
    - Bubble uses `var(--color-muted)` with dynamic radius.
    - Added subtle shadows and hover transitions.
- **Right Message**:
    - Bubble uses `var(--color-primary)` with dynamic radius.
    - Added subtle shadows and hover transitions.
    - Refined "Seen" indicators with tiny overlapping avatars and 1.5px borders.
- **Text Message**: Removed hardcoded backgrounds; now purely content-focused within its parent bubble.
- **Image Message**: 
    - Fixed padding issues: images now fill the bubble entirely.
    - Parent bubble uses `overflow: hidden` to crop the image with the correct radius.
    - Zoom-in cursor and subtle hover scale effect.
- **File Message**: 
    - Redesigned as a vertical card with a clean download button.
    - Context-aware styling: adapts transparency/borders for left vs. right bubbles.
- **Icon Message**: Enlarged icons to 48px with a "pop-up" hover animation.
- **Typing Indicator**: 
    - Redesigned the "dots" animation to be more subtle and organic.
    - Bubble matches the new `LeftMessage` style.

## 3. System Messages
- **Group & Preference Messages**: 
    - Simplified to a centered pill shape using `var(--color-muted)`.
    - Muted typography and tiny avatars for a non-intrusive "system" feel.
    - Grammatically corrected preview text ("updated preferences").

## 4. Conversation List & Navigation
- **Conversation Items**:
    - "Cooler" design with timestamps on the right.
    - Active state: Added a vertical primary-colored bar on the left.
    - Typography: Used `Inter` with weight and opacity variations for better hierarchy.
    - Transition: 250ms cubic-bezier for interaction smoothness.
- **Chat Info Bar**: 
    - Resized avatar to 38px.
    - Simplified layout with bold typography and clear "Active" status.
- **Buddy List**: Resized avatars to 52px for better proportion.

## 5. Dialogs & Modals
- **Image Viewer**: 
    - Now opens in full-screen (`100vw`/`100vh`).
    - Implemented backdrop blur and a floating close button with rotation effect.

## 6. Technical Integrity
- **Tests**: Full Cypress E2E suite (41/41 tests) passing.
- **API/DTO**: Cleaned up `TypeMessage` interface.
- **Pipes**: Integrated `FormatTimePipe` for list-item timestamps.

---
**Status**: Ready for approval.
