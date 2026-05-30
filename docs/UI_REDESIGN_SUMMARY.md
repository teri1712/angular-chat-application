# T1iChat UI Redesign Documentation: Exaggerated Minimalism

## 1. Overview
The T1iChat application has undergone a comprehensive UI/UX overhaul, moving from a standard Material-heavy interface to a custom **"Exaggerated Minimalism"** design system. This shift prioritizes high-impact typography, massive whitespace, and bold, functional interactions.

### Core Philosophy
- **Type-as-Hero:** Typography (Inter) is used as a primary design element, often oversized and ultra-bold.
- **Loud Minimalism:** High contrast between primary colors and clean backgrounds creates a "statement" aesthetic.
- **Custom Primitives:** Removal of standard Angular Material structural components in favor of bespoke HTML/CSS driven by semantic design tokens.

---

## 2. Design Tokens
All styles are driven by the tokens defined in `src/assets/design-tokens.css`.

### Key Color Palette (Light Mode)
- **Primary:** `#2563EB` (Electric Blue) - Used for active states and primary branding.
- **Accent:** `#059669` (Emerald Green) - Used for success states and primary CTAs.
- **Foreground:** `#0F172A` (Deep Slate) - High-contrast text and borders.
- **Background:** `#FFFFFF` (Pure White) - Base layer for massive whitespace.
- **Muted:** `#F1F5FD` (Soft Blue/Gray) - Secondary backgrounds and hover states.

---

## 3. Component Specifications

### 3.1 Buttons
Primary actions use the `.btn-primary` class.
- **Weight:** 700 (Bold)
- **Radius:** 8px (`var(--radius-md)`)
- **Interaction:** Smooth 200ms transition with a slight upward lift on hover.

### 3.2 Messaging Interface
- **Bubbles:** Large 18px corner radius with 4px "tails" for grouped messages.
- **Typography:** 15px/0.9375rem body text with 1.4 line-height for readability.
- **Info Bar:** Glassmorphism effect (80% opacity + 12px blur) to maintain focus on the current chat.

### 3.3 Side Navigation
- **Dimensions:** Fixed 72px width.
- **Active State:** Solid primary color with soft shadows.
- **Tooltips:** Custom CSS-only tooltips appearing on the right side.

---

## 4. Documentation Resources
The design system is managed hierarchically using the `ui-ux-pro-max` pattern:

- **Global Source of Truth:** `design-system/t1ichat/MASTER.md`
- **Page-Specific Overrides:**
  - `design-system/t1ichat/pages/auth.md`: High-contrast, poster-style typography for login/sign-up.
  - `design-system/t1ichat/pages/messaging.md`: Focus on micro-interactions and tactile feedback in the chat area.
  - `design-system/t1ichat/pages/settings.md`: Clean, single-column layout for configuration items.

---

## 5. Development Guidelines for New Components
When adding new UI elements, follow these rules:

1. **Avoid Emojis:** Always use SVG icons (Material Icons font is currently used via `.material-icons` class).
2. **Use Semantic Tokens:** Never use hardcoded hex values; always use `var(--color-*)` or `var(--space-*)`.
3. **Respect Whitespace:** Prefer generous padding (`var(--space-lg)` or higher) to avoid clutter.
4. **Interactive Feedback:** All clickable elements must have `cursor: pointer` and a defined hover/active state with a transition duration between 150-300ms.
5. **Bold Titles:** Use `900` font weight and negative letter-spacing (`-0.04em` to `-0.06em`) for main page titles.
