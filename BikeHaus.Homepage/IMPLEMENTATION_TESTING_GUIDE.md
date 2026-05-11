# 🚀 Hero Section 2026 - Implementation & Testing Guide

## Quick Start

### 1. Build & Test Locally

```bash
# Navigate to Homepage project
cd d:\projects\bikehausfreiburg\BikeHaus.Homepage

# Install dependencies (if needed)
npm install

# Start dev server
npm start

# Open browser
# http://localhost:4200
```

### 2. Check Console

```bash
# Should see NO errors about:
# ✅ hero-section component
# ✅ Missing RouterModule
# ✅ Missing imports
```

---

## File Changes Summary

### Created Files

```
✅ hero-section.component.html (198 lines)
   - Modern template with glassmorphism
   - Responsive grid layouts
   - Animated background shapes
   - CTA buttons with routing

✅ hero-section.component.ts (14 lines)
   - Component logic
   - RouterModule import

✅ hero-section.component.scss (500+ lines)
   - Pure CSS (no Tailwind needed)
   - 8 keyframe animations
   - Responsive media queries
   - Accessibility support
   - Dark/light mode variants

✅ HERO_DESIGN_GUIDE.md
   - Complete design system
   - Implementation checklist
   - Performance specs
   - Accessibility guidelines

✅ FIGMA_MOCKUP_SPEC.md
   - Detailed layer breakdown
   - Component specifications
   - Responsive adjustments
   - Design tokens
```

### Updated Files

```
🔄 home.component.ts
   - Added: import HeroSectionComponent
   - Added: HeroSectionComponent to imports array
   - Changed: Hero template → <app-hero-section></app-hero-section>
```

---

## Testing Checklist

### ✅ Visual Testing

**Desktop (1440px+)**

- [ ] Hero section spans full viewport height
- [ ] Animated blobs move smoothly
- [ ] Title gradient text flows
- [ ] Buttons display side-by-side
- [ ] Stats cards show in 3-column grid
- [ ] Scroll indicator bounces at bottom

**Tablet (768px)**

- [ ] Layout adjusts properly
- [ ] Buttons stack vertically
- [ ] Text sizes reduce appropriately
- [ ] No horizontal scrolling

**Mobile (375px)**

- [ ] Full-width layout
- [ ] Button text readable
- [ ] Stats cards responsive
- [ ] Animations smooth (60fps)
- [ ] Touch targets ≥44×44px

### ✅ Interaction Testing

**Buttons**

- [ ] Primary button: Hover glow effect
- [ ] Primary button: Shine animation on hover
- [ ] Primary button: Icon slides right on hover
- [ ] Secondary button: Glass effect changes on hover
- [ ] Both buttons: Click feedback (scale down)
- [ ] Both buttons: Links work (routerLink)

**Animations**

- [ ] Blobs animate independently (7s loop)
- [ ] Badge dot pulses (2s cycle)
- [ ] Title gradient flows (3s cycle)
- [ ] Scroll indicator bounces (2s cycle)
- [ ] All animations smooth (no jank)

**Keyboard Navigation**

- [ ] Tab through interactive elements
- [ ] Focus ring visible (emerald outline)
- [ ] Enter key activates buttons
- [ ] Escape key works (if modal)

### ✅ Performance Testing

```bash
# Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Click "Lighthouse" tab
3. Click "Analyze page load"
4. Check metrics:
   - Performance: 95+
   - Accessibility: 100
   - Best Practices: 100
   - SEO: 100
```

**Core Web Vitals**

- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

```bash
# Network analysis
1. Open Chrome DevTools → Network tab
2. Hard refresh (Ctrl+Shift+R)
3. Check:
   - Page load: < 3s
   - CSS size: < 50KB
   - Total: < 500KB
   - No unused CSS
```

### ✅ Accessibility Testing

**Screen Reader (NVDA/JAWS)**

```bash
1. Download NVDA (free): https://www.nvaccess.org
2. Enable screen reader (Ctrl+Alt+N on Windows)
3. Navigate page with arrow keys
4. Listen for:
   - Correct heading hierarchy (h1)
   - Button labels clearly read
   - Link text makes sense
   - Images have alt text
```

**Keyboard Only**

```bash
1. Unplug mouse
2. Use Tab to navigate
3. Use Enter/Space to activate buttons
4. Verify:
   - All buttons accessible
   - Focus ring visible
   - Tab order logical
```

**Color Contrast**

```bash
1. Open WAVE Browser Extension:
   https://wave.webaim.org/extension
2. Check for contrast errors:
   - Green: ✅ Passed
   - Red: ❌ Failed (fix immediately)
```

**Motion Preferences**

```bash
1. Windows: Settings → Ease of Access → Display
2. Enable: Show animations
3. Test:
   - Animations respect setting
   - No forced motion for sensitive users
```

---

## Common Issues & Fixes

### Issue 1: Buttons not clickable

**Problem:** Links don't work

```
Error: Cannot match any routes. URL Segment: 'de/neue-fahrraeder'
```

**Fix:**

```typescript
// Check app.routes.ts has these routes
{
  path: 'de',
  children: [
    { path: 'neue-fahrraeder', component: ... },
    { path: 'fahrradverleih', component: ... }
  ]
}
```

---

### Issue 2: SCSS not compiling

**Problem:** Styles not applied

```
Error: Cannot find stylesheet
```

**Fix:**

```bash
# Clear Angular build cache
rm -rf dist/
rm -rf .angular/

# Rebuild
ng build
```

---

### Issue 3: Animations lag on mobile

**Problem:** Blobs stutter

```
Animation is choppy / frame rate low
```

**Fix:**

```scss
// Add GPU acceleration
.blob {
  will-change: transform;
  transform: translateZ(0);
}

// Reduce blur for low-end devices
@media (max-width: 480px) {
  .blob {
    filter: blur(40px); // Reduced from 60px
  }
}
```

---

### Issue 4: Glassmorphism not visible

**Problem:** Glass effect looks plain

```
backdrop-filter not working
```

**Fix:**

```scss
// Add fallback for unsupported browsers
.hero-badge {
  background: rgba(255, 255, 255, 0.1);

  @supports (backdrop-filter: blur(12px)) {
    backdrop-filter: blur(12px);
  }

  @supports not (backdrop-filter: blur(12px)) {
    background: rgba(255, 255, 255, 0.15); // More opaque fallback
  }
}
```

---

## Browser DevTools Tips

### Chrome DevTools

**Simulate Devices**

```
1. F12 → Device Toolbar (Ctrl+Shift+M)
2. Select device: iPhone 12, iPad, Pixel 5
3. Test responsiveness
```

**Performance Profiling**

```
1. F12 → Performance tab
2. Click Record (red dot)
3. Interact with page
4. Stop recording
5. Look for:
   - Green bars (good)
   - Red areas (problems)
   - Long tasks (> 50ms)
```

**Network Throttling**

```
1. F12 → Network tab
2. Throttling: Select "Slow 3G"
3. Reload page
4. Verify load time acceptable
```

---

## Deployment Checklist

### Before Deploying

- [ ] All tests passing
- [ ] No console errors
- [ ] Lighthouse score 95+
- [ ] Accessibility audit passed
- [ ] Mobile responsive verified
- [ ] Animations smooth on target devices
- [ ] Routing works correctly
- [ ] Images optimized
- [ ] CSS minified

### Production Build

```bash
# Build for production
ng build --configuration production

# Check output size
ls -lh dist/bike-haus.homepage/

# Expected:
# main.js: < 200KB
# styles.css: < 50KB
```

### Deploy to Server

```bash
# Using Docker
docker build -t bikehausfreiburg-homepage:latest .
docker run -p 80:80 bikehausfreiburg-homepage:latest

# Or traditional:
scp -r dist/bike-haus.homepage/* user@server:/var/www/homepage/
```

### Post-Deployment

- [ ] Test on production domain
- [ ] Verify HTTPS working
- [ ] Check analytics load
- [ ] Monitor error logs
- [ ] Collect user feedback

---

## Performance Monitoring

### Google Analytics Setup

```javascript
// Add to gtag tracking
gtag("event", "hero_cta_click", {
  button: "kaufen" | "vermietung",
});
```

### Metrics to Track

| Metric            | Target | Tool      |
| ----------------- | ------ | --------- |
| Page Load Time    | < 3s   | Analytics |
| Bounce Rate       | < 50%  | Analytics |
| Avg. Session      | > 2m   | Analytics |
| CTA Click Rate    | > 15%  | Analytics |
| Mobile Conversion | > 10%  | Analytics |

---

## Feedback & Iteration

### Collect User Data

1. **Heatmap Analysis** (Hotjar)
   - Where do users scroll?
   - Which buttons get clicked?
   - Where do users exit?

2. **Session Recordings** (Hotjar)
   - How do users interact with page?
   - Any confusion or friction?
   - Mobile experience okay?

3. **Surveys**
   - "What do you think of this design?"
   - "Would you recommend?"
   - "Any issues encountered?"

### A/B Testing

Test variations:

- [ ] Hero text copy variations
- [ ] Button colors (emerald vs orange)
- [ ] Animations on/off
- [ ] Different background patterns

---

## Quick Reference Commands

```bash
# Development
npm start                    # Start dev server
ng serve                     # Angular serve

# Building
ng build                     # Dev build
ng build --configuration production  # Prod build

# Testing
ng test                      # Unit tests
ng e2e                       # E2E tests

# Linting
ng lint                      # Check code quality

# Cleanup
rm -rf dist/ .angular/      # Clean cache
npm install                 # Reinstall deps
```

---

## Support

**Issues?**

1. Check this guide's "Common Issues" section
2. Review component files for comments
3. Check browser console for errors
4. Test in different browsers

**Questions?**

- See HERO_DESIGN_GUIDE.md for design specs
- See FIGMA_MOCKUP_SPEC.md for component details
- Review hero-section.component.scss for styling

---

## Success Metrics (30 days post-launch)

| Metric           | Baseline | Target   | Result |
| ---------------- | -------- | -------- | ------ |
| Page Load Time   | 4.2s     | < 2.5s   | \_\_   |
| Bounce Rate      | 45%      | < 35%    | \_\_   |
| CTA Click Rate   | 8%       | > 15%    | \_\_   |
| Mobile Traffic % | 60%      | Maintain | \_\_   |
| Conversion Rate  | 2.1%     | > 3%     | \_\_   |

---

**Last Updated:** May 11, 2026
**Status:** Ready for Testing
**Next Step:** Begin Phase 2 (Testing)
