# Messaging Page Overrides

> **PROJECT:** T1iChat
> **Generated:** 2026-05-30 22:54:42
> **Page Type:** Messaging Interface

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Component Specs

#### Message Bubbles
- **Radius Strategy**: 
    - Rounded corners: `var(--radius-xl)` (16px)
    - Group inner corners: `var(--radius-xs)` (2px)
- **Colors**:
    - Left: `var(--color-muted)` with `var(--color-foreground)`
    - Right: `var(--color-primary)` with `var(--color-on-primary)`
- **Shadow**: `var(--shadow-sm)` on idle, `var(--shadow-md)` on hover.

#### Avatars
- **Message List**: 28px
- **Chat Info Bar**: 38px
- **Style**: Circular, `box-shadow: var(--shadow-sm)`

#### Image Messages
- **Constraint**: No padding inside bubble.
- **Visual**: `overflow: hidden` on parent bubble to crop image. `cursor: zoom-in`.
- **Hover**: Subtle scale (1.02).

#### File Messages
- **Layout**: Vertical card with embedded download action.
- **Visual**: Semi-transparent background (adaptive to bubble color).

#### Typing Indicator
- **Animation**: 3-dot pulse, `1.4s infinite ease-in-out`.
- **Visual**: Opacity `0.3` to `1.0`.

#### Chat Info Bar
- **Layout**: Minimal header, bold room name, accent-colored presence text.
- **Glassmorphism**: `backdrop-filter: blur(12px)`.

---

## Component Overrides

- **Avoid**: Fixed padding on image messages (use full-bleed).
- **Avoid**: Hardcoded bubble colors (use semantic tokens).
- **Avoid**: Large avatars in list view (prefer 28px).

---

## Recommendations

- **Effects**: 250ms cubic-bezier transitions for all interactive surfaces.
- **Accessibility**: Ensure 1.5px borders on overlapping avatars (seen indicators) for separation.
- **UX**: Clickable images must open full-screen viewer (`100vw`/`100vh`).
