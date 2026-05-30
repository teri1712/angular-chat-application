# Dialogs Page Overrides

> **PROJECT:** T1iChat
> **Generated:** 2026-05-30 22:54:42
> **Page Type:** Sidebar & Modals

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Component Specs

#### Conversation List Item
- **Avatar Size**: 40px
- **Active State**: 
    - Indicator: 4px vertical bar on the left (`var(--color-primary)`).
    - Background: `var(--color-muted)`.
    - Transition: `250ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Typography**: 
    - Room Name: `0.9375rem`, Semi-bold.
    - Message Preview: `0.8125rem`, Opacity `0.6`.
    - Time: `0.75rem`, Opacity `0.5`, right-aligned.

#### Image Viewer Dialog
- **Size**: Full-screen (`100vw` / `100vh`).
- **Backdrop**: Black background with `blur(12px)` on interactive buttons.
- **Interaction**: Close on click outside (scrim) or specialized close button.
- **Transitions**: Scale up on enter, rotation/scale on close button hover.

---

## Component Overrides

- **Avatar Size**: Standardized to 40px in sidebar for consistent density.
- **Active Indicator**: Uses vertical bar instead of full border for a "cooler" look.

---

## Recommendations

- **Interaction**: 
    - Hover on conversation items should subtly lighten the background.
    - "Seen" indicators in the list should overlap slightly to conserve space.
- **Typography**: Use tabular figures for the timestamp to prevent layout shifts.
