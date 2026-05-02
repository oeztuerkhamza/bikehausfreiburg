# On-Page Content Audit Reference

This is the deep reference for Workflow 3 in the main SKILL.md. Use it when auditing a page for SEO performance.

## Table of contents

1. The audit framework
2. Search intent — the #1 factor
3. Title & H1
4. Heading hierarchy
5. Content depth and topical coverage
6. E-E-A-T signals
7. Internal linking
8. Image SEO
9. Schema markup (with templates)
10. Core Web Vitals & page experience
11. Mobile-friendliness
12. Conversion clarity
13. Technical hygiene checks
14. The output: a prioritized fix list

---

## 1. The audit framework

A useful audit doesn't list 50 minor issues. It identifies the **5–7 highest-impact problems**, ranks them by ROI (impact ÷ effort), and gives the user clear next steps. The framework:

1. **Diagnose** what the page is currently doing well and badly
2. **Compare** to the top-3 ranking results for the target query (manually or by description)
3. **Prioritize** by likely lift × ease of implementation
4. **Specify** exactly what to change, with copy-paste-ready text or code where possible

The structure of the deliverable should be predictable: Quick Wins first (fix today, low effort), then Medium (fix this month), then Heavy Lifts (architectural changes that need planning).

---

## 2. Search intent — the #1 factor

Before auditing anything else, answer: **does this page match what users searching this query actually want?**

The four classical intents:

- **Informational** — "what is X", "how does X work", "Y meaning". User wants explanation.
- **Navigational** — "{brand} login", "facebook". User wants a specific destination.
- **Commercial / investigation** — "best X", "X reviews", "X vs Y". User is comparing before buying.
- **Transactional** — "buy X", "X near me", "X for sale". User is ready to act.

Look at the top 10 results for the query. If they're all comparison guides (commercial intent) and your page is a product page (transactional), you've got an intent mismatch and **no on-page tweaks will fix it**. The fix is either changing the page type or targeting a different query.

Modern Google often blends intents. A query like "running shoes" returns commercial guides AND product carousels AND retailer pages — meaning multiple page types can rank, but each must be the best example of its type.

---

## 3. Title & H1

- **Title tag** lives in `<head>`, drives the SERP listing. Covered fully in `references/meta-optimization.md`.
- **H1** is the visible page heading users see when they arrive.
- They should be **related but not identical**. Title = SERP-optimized; H1 = user-experience-optimized once they're on the page.

**Audit checks:**
- Is there exactly one H1? (More than one is a common error.)
- Does the H1 contain the primary keyword?
- Does the H1 tell the user "yes, you're in the right place" within 1 second of landing?
- Are title and H1 wildly different in topic? If so, expectation mismatch.

---

## 4. Heading hierarchy

Headings (H1 → H6) should reflect document structure, not visual styling. Common errors:

- Using `<h2>` for a paragraph just because it's bigger
- Skipping levels (H1 → H3 with no H2)
- Multiple H1s
- Decorative text wrapped in headings

**Audit:**
- Pull the heading tree. Does it read as a logical outline of the content?
- Are H2s the major sections, H3s their subsections?
- Do the H2s cover the topical breadth that the top-ranking pages cover?

A clean hierarchy is also AI-friendly — both Google's AI Overviews and other LLMs use heading structure to extract answers.

---

## 5. Content depth and topical coverage

**Word count is a proxy, not a target.** Don't pad. Instead:

1. List the **subtopics** the top-ranking pages cover for the target query.
2. Check which ones the audited page is missing.
3. Add only the missing topics that genuinely help the user.

A 600-word page that nails the user's question can outrank a 4000-word page that buries the answer.

**Topical coverage signals to look for:**

- Does the page answer follow-up questions a curious user would have? (Use "People Also Ask" results as a checklist.)
- Are key terms and related concepts covered, even if not the primary keyword?
- Are practical examples, data, or specifics included? Generic advice rarely ranks anymore.

---

## 6. E-E-A-T signals

Experience, Expertise, Authoritativeness, Trustworthiness. Not a single ranking factor, but a framework Google uses, especially for YMYL ("Your Money or Your Life") topics: health, finance, legal.

**Visible signals to check on the page:**

- **Author byline** with a real name, photo, and link to a bio page
- **Credentials** displayed (where relevant — "Certified bike mechanic, 12 years experience")
- **Citations** to authoritative sources, where claims could be challenged
- **Last-updated date**, especially if content covers fast-moving topics
- **Original photos / videos / first-hand experience** — not just stock images
- **Customer reviews / testimonials** with verifiable details

For commerce pages: trust badges, return policy visibility, customer service contact, real address.

---

## 7. Internal linking

Internal links serve three purposes: navigation for users, distributing link equity ("PageRank") across the site, and helping Google understand site topology.

**Audit:**

- **Inbound links to this page:** how many other pages on the site link to it? With what anchor text? (At minimum, link from the homepage and from any topic-cluster hub page.)
- **Outbound links from this page:** does it link to relevant supporting content elsewhere on the site? Does it link to authoritative external sources where appropriate?
- **Anchor text variety:** internal links should use descriptive anchor text (`our beginner mountain bike guide`) rather than generic ones (`click here`, `read more`).
- **Orphan pages:** a page with zero internal links is invisible to Google. Always fix.

---

## 8. Image SEO

- **Filenames:** `red-trek-mountain-bike-2026.jpg`, not `IMG_4827.jpg`.
- **Alt text:** describes the image for screen readers and Google. Should be natural and describe what's in the image; including the keyword is fine if it's accurate.
- **File size:** compress aggressively. Aim for <100KB per image where possible.
- **Format:** WebP or AVIF for hero images (~30% smaller than JPEG at the same quality). PNG only for transparency or sharp lines.
- **Lazy loading:** `loading="lazy"` on images below the fold. Don't lazy-load the LCP image — that hurts Core Web Vitals.
- **Width and height attributes:** specify in HTML to prevent layout shift.
- **Image sitemap:** for image-heavy sites, submit one to Search Console.

---

## 9. Schema markup (with templates)

Schema (structured data) helps Google understand what the page is about and unlocks rich SERP features. Use JSON-LD format in the page `<head>`. Always validate at validator.schema.org and at search.google.com/test/rich-results.

**Common types and when to use them:**

### LocalBusiness (for any brick-and-mortar)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Bikehaus Freiburg",
  "image": "https://example.com/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Habsburgerstraße 50",
    "addressLocality": "Freiburg",
    "postalCode": "79104",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.999,
    "longitude": 7.851
  },
  "telephone": "+49-761-1234567",
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "18:30"
  }],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "847"
  }
}
```

### Product (for ecommerce pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Trek Marlin 7 Mountain Bike",
  "image": ["https://example.com/marlin7.jpg"],
  "description": "Hardtail mountain bike for trail beginners.",
  "sku": "TM7-2026-RED-L",
  "brand": {"@type":"Brand","name":"Trek"},
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/trek-marlin-7",
    "priceCurrency": "EUR",
    "price": "899.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "128"
  }
}
```

### Article (for blog posts and guides)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Choose Your First Mountain Bike",
  "image": "https://example.com/hero.jpg",
  "author": {
    "@type": "Person",
    "name": "Anna Müller",
    "url": "https://example.com/team/anna-mueller"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bikehaus Freiburg",
    "logo": {"@type":"ImageObject","url":"https://example.com/logo.png"}
  },
  "datePublished": "2026-04-15",
  "dateModified": "2026-04-30"
}
```

### FAQPage (when the page has 3+ Q&A blocks)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What size mountain bike do I need?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Frame size depends on your height and inseam. For 170–180cm riders, an M (17–18 inch) frame typically fits."
    }
  }]
}
```

### BreadcrumbList (almost every non-homepage page)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://example.com/"},
    {"@type":"ListItem","position":2,"name":"Mountain Bikes","item":"https://example.com/mountain-bikes"},
    {"@type":"ListItem","position":3,"name":"Trek Marlin 7"}
  ]
}
```

**Don't:**
- Use schema for content not actually on the page (Google calls this "spammy structured data" — manual penalty risk).
- Stack many overlapping schema types on a single page just hoping for rich results. Pick the most accurate primary type.

---

## 10. Core Web Vitals & page experience

The three CWV metrics that affect both ranking and user experience:

| Metric | What it measures | Good threshold |
|--------|-----------------|----------------|
| **LCP** (Largest Contentful Paint) | Time until the main content visible | < 2.5s |
| **INP** (Interaction to Next Paint) | Responsiveness to clicks/taps | < 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability — does the page jump around as it loads? | < 0.1 |

**Common LCP problems:**
- Hero image too large or unoptimized
- Render-blocking JavaScript or CSS
- Slow server response (TTFB > 600ms)
- Hero image lazy-loaded (don't lazy-load LCP)

**Common INP problems:**
- Heavy JavaScript on click handlers
- Long tasks blocking the main thread
- Third-party scripts (chat widgets, analytics, ads)

**Common CLS problems:**
- Images without width/height attributes
- Ads or embeds inserted dynamically
- Web fonts swapping without reservation
- Banners that push content down after load

Run a real measurement (PageSpeed Insights, Lighthouse, or CrUX dashboard) — don't guess. The user can paste the URL into PageSpeed Insights and share the results back.

---

## 11. Mobile-friendliness

Google indexes mobile-first. The mobile version is the source of truth.

**Checks:**

- Content parity — is everything from the desktop version present on mobile? (Hidden behind tabs/accordions is fine, but absent is not.)
- Tap target sizes — 48×48 pixels minimum, with adequate spacing.
- Font size — at least 16px body text. Anything smaller fails accessibility and frustrates users.
- Viewport meta — `<meta name="viewport" content="width=device-width, initial-scale=1">` must be set.
- No horizontal scrolling on standard mobile viewports.

---

## 12. Conversion clarity

A page ranking #1 that doesn't convert is wasted traffic. Audit the conversion path:

- Is the primary CTA visible above the fold on mobile?
- Is there one clear action, or is the user offered five competing choices?
- Does the page demonstrate trust (reviews, guarantees, certifications) near the CTA?
- For forms: are fields kept minimal? Each extra field reduces conversion ~5–7%.
- For ecommerce: is the price clear? Shipping cost? Stock status?

This isn't strictly SEO, but recommending SEO improvements without flagging conversion issues is malpractice.

---

## 13. Technical hygiene checks

Quick checks that often surface real problems:

- **Indexability:** is the page allowed to be indexed? Check `robots.txt`, `<meta name="robots">`, and HTTP X-Robots-Tag. If the page is `noindex`, that's the entire problem.
- **Canonical tag:** does it point to the page itself, or to another URL? An incorrect canonical tells Google to ignore this page.
- **HTTPS:** is the page on HTTPS, with no mixed-content warnings?
- **Status code:** does the page return 200? (Sometimes "ranking pages" are actually 404s with custom designs.)
- **Sitemap inclusion:** is the URL in the XML sitemap?
- **Hreflang:** if the site has multiple languages, are hreflang tags reciprocal and self-referencing?

---

## 14. The output: a prioritized fix list

Final deliverable structure:

```
PAGE AUDIT: [URL]
Target query: [primary keyword]
Current rank: [position] (from GSC if available)

🟢 QUICK WINS (do this week)
1. [Fix] — [Why it matters] — [How to verify]
2. ...

🟡 MEDIUM EFFORT (do this month)
1. ...

🔴 HEAVY LIFTS (plan for next quarter)
1. ...
```

Each item must be specific. Not "improve content quality" but "Add a 200-word section answering 'how to size a mountain bike' between the H2 'Choosing a frame' and 'Choosing components'. Include a sizing table with rider height vs frame size. The top-ranking page covers this and your page doesn't."
