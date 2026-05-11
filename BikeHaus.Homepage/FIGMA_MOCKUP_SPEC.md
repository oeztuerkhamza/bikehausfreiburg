# 🎨 Figma Design Mockup Specification

## Hero Section - 2026 Modern Design

### Figma File Structure

```
BikeHaus Hero 2026 (Main Frame: 1440 x 900)
├── Desktop (1440 × 900)
│   ├── Background
│   │   ├── Gradient (Navy 0f172a → 1e293b)
│   │   ├── Animated Blobs (3 layers)
│   │   └── Grid Pattern Overlay
│   ├── Content
│   │   ├── Badge (glass effect)
│   │   ├── Title (gradient text)
│   │   ├── Subtitle
│   │   ├── CTA Buttons (2)
│   │   ├── Stats Cards (3)
│   │   └── Scroll Indicator
│
├── Tablet (768 × 1024)
│   └── [Same structure, adjusted sizing]
│
└── Mobile (375 × 812)
    └── [Responsive stack layout]
```

---

## Layer Breakdown

### 1. Background Layers

**Gradient Base**

- Type: Linear gradient
- Angle: 135°
- Color 1: #0f172a (Navy dark)
- Color 2: #1e293b (Navy light)
- Color 3: #0f172a (Navy dark)
- Blend: Normal

**Blob 1**

- Shape: Circle (320×320px)
- Position: Top-right (-40, -20)
- Color: rgba(16, 185, 129, 0.3) - Emerald
- Filter: Blur 60px
- Blend: Multiply
- Animation: blob 7s infinite

**Blob 2**

- Shape: Circle (320×320px)
- Position: Top-left (-40, 20%)
- Color: rgba(249, 115, 22, 0.2) - Orange
- Filter: Blur 60px
- Blend: Multiply
- Animation: blob 7s infinite (delay: 2s)

**Blob 3**

- Shape: Circle (320×320px)
- Position: Bottom-center (25%, 100%)
- Color: rgba(16, 185, 129, 0.1) - Emerald light
- Filter: Blur 60px
- Blend: Multiply
- Animation: blob 7s infinite (delay: 4s)

**Grid Overlay**

- Pattern: 40px × 40px grid
- Color: rgba(255, 255, 255, 0.1)
- Opacity: 10%

---

### 2. Badge Component

```
┌─────────────────────────────┐
│ ● 🚴 Bike Haus Freiburg     │
└─────────────────────────────┘
```

**Styling**

- Background: rgba(255, 255, 255, 0.1)
- Border: 1px rgba(255, 255, 255, 0.2)
- Padding: 8px 16px
- Border Radius: 999px
- Backdrop Filter: blur(12px)
- Font: 14px, weight 500
- Color: rgba(16, 185, 129, 0.8)

**Dot**

- Size: 8×8px
- Color: #10b981
- Animation: pulse 2s ease-in-out infinite

**Hover State**

- Border: 1px rgba(16, 185, 129, 0.5)
- Background: rgba(255, 255, 255, 0.2)
- Transition: 0.3s ease

---

### 3. Main Title

```
Die beste
Fahrrad-Erfahrung
in Freiburg
```

**Typography**

- Font: Inter, sans-serif
- Size: clamp(2.5rem, 7vw, 4rem)
- Weight: 700
- Line Height: 1.2
- Letter Spacing: -0.02em

**Line 1 & 3 (White)**

- Color: #ffffff
- Margin-bottom: 4px

**Line 2 (Gradient)**

- Gradient: #10b981 → #f97316 → #10b981
- Background-size: 200% 200%
- Animation: gradient-shift 3s ease infinite
- Text: transparent
- -webkit-background-clip: text

---

### 4. Subtitle

```
Verkauf • Reparatur • Verleih. Alles aus einer Hand
mit über 10+ Jahren Erfahrung und persönlicher Beratung.
```

**Typography**

- Font: Inter, sans-serif
- Size: clamp(1rem, 2vw, 1.25rem)
- Weight: 400
- Line Height: 1.6
- Color: #cbd5e1
- Max-width: 700px
- Margin: 0 auto

---

### 5. CTA Buttons

#### Primary Button "Jetzt Fahrrad kaufen"

```
[→] Jetzt Fahrrad kaufen
```

**Normal State**

- Background: linear-gradient(135deg, #10b981, #059669)
- Color: #ffffff
- Padding: 16px 32px
- Border Radius: 999px
- Font: 16px, weight 600
- Box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3)
- Cursor: pointer

**Hover State**

- Transform: translateY(-2px)
- Box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4)
- Background: Darker gradient
- Icon: translateX(4px)
- Shine animation: sweep left to right

**Active State**

- Transform: scale(0.95)
- Box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2)

**Focus State**

- Outline: 2px solid #10b981
- Outline-offset: 2px

---

#### Secondary Button "Zur Vermietung"

```
[←] Zur Vermietung
```

**Normal State**

- Background: rgba(255, 255, 255, 0.1)
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Backdrop Filter: blur(12px)
- Color: #ffffff
- Padding: 16px 32px
- Border Radius: 999px
- Font: 16px, weight 600

**Hover State**

- Border-color: rgba(249, 115, 22, 0.5)
- Background: rgba(255, 255, 255, 0.2)
- Transform: translateY(-2px)
- Icon: translateX(-4px)

**Icon**

- Size: 20×20px
- Stroke: currentColor
- Stroke-width: 2

---

### 6. Stats Cards

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   500+       │  │    10+       │  │  ⭐ 4.9      │
│  Fahrräder   │  │   Jahre      │  │   Rating     │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Card Layout**

- Grid: 3 columns (auto-fit)
- Gap: 16px
- Max-width: 600px
- Margin: 32px auto 0

**Card Styling (Single)**

- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Backdrop Filter: blur(12px)
- Padding: 24px
- Border Radius: 8px
- Transition: 0.3s ease

**Number**

- Font: 28px, weight 700
- Color: #10b981 (hover: #f97316)
- Display: block

**Label**

- Font: 12px, weight 400
- Color: #94a3b8
- Margin-top: 8px
- Text-transform: uppercase
- Letter-spacing: 0.05em

**Hover State**

- Background: rgba(255, 255, 255, 0.1)
- Border-color: rgba(16, 185, 129, 0.5)
- Transform: translateY(-4px)
- Number color changes

---

### 7. Scroll Indicator

```
       Scroll
         ⬇
```

**Position**

- Bottom: 32px
- Left: 50%
- Transform: translateX(-50%)

**Label**

- Font: 12px, weight 600
- Color: #94a3b8
- Text-transform: uppercase
- Letter-spacing: 0.1em

**Icon**

- Size: 24×24px
- Color: #10b981
- Animation: bounce-down 2s ease-in-out infinite

---

## Responsive Adjustments

### Tablet (768px)

| Element        | Desktop                   | Tablet                         |
| -------------- | ------------------------- | ------------------------------ |
| Title Size     | clamp(2.5rem, 7vw, 4rem)  | clamp(2rem, 5vw, 3.5rem)       |
| Subtitle Size  | clamp(1rem, 2vw, 1.25rem) | clamp(0.95rem, 1.8vw, 1.15rem) |
| Button Padding | 16px 32px                 | 14px 28px                      |
| Stats Gap      | 16px                      | 12px                           |
| Hero Padding   | -                         | 16px                           |

### Mobile (375px)

| Element        | Mobile                    |
| -------------- | ------------------------- |
| Title Size     | 28px (fixed)              |
| Subtitle Size  | 16px                      |
| Button Layout  | Full-width stacked        |
| Button Padding | 12px 20px                 |
| Stats Columns  | 3 (responsive scale down) |
| Hero Padding   | 16px                      |

---

## Animation Timings

| Animation         | Duration | Timing      | Delay    |
| ----------------- | -------- | ----------- | -------- |
| Blob 1            | 7s       | infinite    | 0s       |
| Blob 2            | 7s       | infinite    | 2s       |
| Blob 3            | 7s       | infinite    | 4s       |
| Fade-in (content) | 0.8s     | ease-out    | 0s       |
| Gradient-shift    | 3s       | ease        | infinite |
| Button hover      | 0.3s     | ease        | -        |
| Shine effect      | 0.5s     | ease-in-out | on hover |
| Scroll bounce     | 2s       | ease-in-out | infinite |
| Badge pulse       | 2s       | ease-in-out | infinite |

---

## Export Instructions

### For Development

1. **Export Styles**
   - SCSS Variables: Colors, fonts, sizes
   - CSS Grid/Flex layouts
   - Animation keyframes

2. **Export Assets**
   - SVG Icons (hero-icons, arrow, scroll)
   - Background patterns (if needed)

3. **Document**
   - Design tokens
   - Component specs
   - Responsive rules

### File Formats

- Icons: SVG (inline in HTML)
- Backgrounds: CSS gradients (no images)
- Patterns: SVG or CSS

---

## Browser Support

| Browser        | Version | Support |
| -------------- | ------- | ------- |
| Chrome         | 90+     | ✅ Full |
| Firefox        | 88+     | ✅ Full |
| Safari         | 14+     | ✅ Full |
| Edge           | 90+     | ✅ Full |
| iOS Safari     | 14+     | ✅ Full |
| Chrome Android | 90+     | ✅ Full |

**Features:**

- ✅ CSS Gradients
- ✅ CSS Animations
- ✅ Backdrop Filter (Safari 14+)
- ✅ Clamp() function
- ✅ CSS Variables
- ✅ Transform & transitions

---

## Design Tokens

### Spacing Scale

```
4px   → xs
8px   → sm
12px  → md
16px  → lg
24px  → xl
32px  → 2xl
```

### Border Radius

```
4px   → sm
8px   → md
16px  → lg
999px → full (pills)
```

### Shadows

```
Small:   0 2px 4px rgba(0,0,0,0.1)
Medium:  0 10px 30px rgba(16, 185, 129, 0.3)
Large:   0 15px 40px rgba(16, 185, 129, 0.4)
```

### Z-Index Stack

```
Background blobs: 0
Grid overlay: 1
Content: 10
Scroll indicator: 10
```

---

**Figma File:** [Link to be added]
**Last Updated:** May 11, 2026
**Status:** Ready for Handoff
