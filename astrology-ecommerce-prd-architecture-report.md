# ASTROLOGY E-COMMERCE — PRODUCT REQUIREMENTS, RESEARCH & TECHNICAL ARCHITECTURE REPORT

**Prepared for:** Handoff to AI engineering agent ("Anti-Gravity") before development starts
**Domain:** Astrology / Spiritual / Crystal / Healing Products E-Commerce (India-first)
**Stack constraints given:** MongoDB, Render (backend hosting), Razorpay (payments), Cloudinary (media), Google OAuth + Email/Password auth

> **How to read this document.** Every factual claim about the two reference sites is labeled **[OBSERVED]** (verified by fetching the live site) or **[ASSUMED]** (inferred/unverifiable — treated as an assumption, not fact). Every requirement is labeled **MUST HAVE / SHOULD HAVE / NICE TO HAVE / NOT REQUIRED / FUTURE FEATURE**. Every place where the original brief is unsafe, contradictory, or architecturally weak is flagged with **RECOMMENDATION: CHANGE THIS**.

---

## 1. Executive Summary

We are building a **standalone, self-owned, production-grade e-commerce platform** for physical spiritual/healing products (crystals, bracelets, pendants, rings, pyramids, spheres, kits, idols, home decor) targeted primarily at Indian customers, with MongoDB + Node-style backend on Render, Razorpay for payments, Cloudinary for media, and Google/email authentication.

Two reference sites were analyzed:

- **talktocrystals.com** — a mature Shopify-based crystal/healing-product store. This site is **directly comparable** to our target platform (same product category, same market, same business model: physical product e‑commerce). It was fully accessible for research and yielded rich, verifiable UX/data patterns.
- **cosmicdevineworldbysharenn.exlyapp.com** — built on **Exly**, a SaaS platform for coaches/creators to sell **courses, live sessions, 1:1 consultations, and workshops** — i.e., a **bookings/services business**, not a physical-product storefront. **[OBSERVED]** The page itself is a JavaScript single-page app that returned no crawlable content on direct fetch, so its specific page-level UX could not be verified firsthand. **[ASSUMED]** Based on independently verified information about the Exly platform (typical Exly storefronts), this class of site is oriented around: scheduling/calendar booking, session/course listing pages, lead capture forms, WhatsApp/email automated reminders, and Stripe/Razorpay-style checkout for session slots — not SKU/variant/stock-driven product catalogs. **Because of this mismatch, most of its patterns are not directly transferable to a product-catalog e-commerce build**, but the underlying business model (arguably "sell a consultation as a product") is useful **future-proofing** input, since talktocrystals itself also sells "Guidance Services" as a bolt-on. See Section 2.2.

**Key learning going into architecture:** the highest-leverage pattern in this vertical, confirmed by talktocrystals' live catalog, is **variant-level pricing and stock** (e.g., a single "Amethyst Bracelet" product has 20+ size/quality variants, each with its own price and independent sold-out state), **purpose/intention-based discovery** (shop by "Love," "Protection," "Abundance" in addition to shop-by-category), and **trust signals specific to this category** (authenticity/certification messaging, because fake/dyed "crystals" are a well-known market problem). These three patterns should be treated as first-class architecture decisions, not afterthoughts.

We also identify **11 places where the original brief should be changed** before build (Section-by-section flags below, summarized in Section 12 as the Security Threat Model and inline as ⚠️ **RECOMMENDATION: CHANGE THIS** callouts). The most important ones:

1. Product/variant stock and pricing must be modeled with **variant as the pricing/inventory unit**, not the product — the brief's "flexible attributes" language undersells how central this is.
2. **COD (Cash on Delivery)** is not in the brief but is a dominant, trust-building payment method in this exact market segment (advertised prominently by the directly comparable competitor). Excluding it is a real conversion risk — flagged as a business decision, not just a technical one.
3. "Delete user account" and "delete order" as stated conflict with financial audit requirements the brief also asks for. Needs a soft-delete/anonymization policy defined **before** schema design, not after.
4. No-OTP + non-mandatory email verification is acceptable but needs explicit compensating controls (rate limiting, CAPTCHA on signup/login, anomaly-based lockout) called out explicitly, or it becomes a spam/fraud vector at checkout.
5. `/admin` protected by "server-side authorization" is correctly stated as a requirement, but the brief doesn't specify **role separation** (super admin vs. limited staff) — recommended as MUST HAVE, not future, because a single shared admin credential is itself a security risk at launch.

---

## 2. Reference Website Analysis

### 2.1 talktocrystals.com — **[OBSERVED]** (fetched live, Sept 2026)

**Navigation**
- Sticky announcement bar: COD availability, free shipping threshold, phone + email — always visible.
- Primary nav = **"Shop By Category"** mega-menu (image tiles: Bracelets, Clusters, Premium Collection, Silver Rings, Tumbled Stones, Roughs, Silver Pendants, Towers, Pendants, Pyramids, Spheres, Ganeshas, Necklaces, Angels…) plus a **secondary, much longer alphabetical "All categories" list** (70+ entries — many are really product **types/forms** like "Cube," "Egg," "Palm stones," "Rollers," "Wands," not top-level merchandising categories).
- Additional nav rails: **"Shop By Purpose"** (intention-based — Abundance & Wealth, Love & Relationships, Protection & Clearing, Health & Well-being, Focus & Manifestation, Expression & Communication, Meditation & Spirituality, Creativity), **"Shop By Crystal"** (crystal-name based — Citrine, Rose Quartz, Amethyst, Pyrite, Selenite, Black Tourmaline, Clear Quartz, Moonstone), **"Events & Services"**, **"Crystal Quiz."**
- **Observation:** this reveals **three parallel taxonomies** layered over the same catalog: (a) product-type category, (b) purpose/intention, (c) crystal/material. This is not a strict category tree — it's category + tags/attributes used as alternate browse entry points.

**Homepage**
- Hero/announcement → category tiles → "Trending Products" carousel → login/cart drawer (slide-out, not full page) → purpose tiles → "Top Selling Products" (tabs: Bestsellers / New Arrivals) → **"Bundle & Save"** (curated multi-crystal kits, fixed price, single "kit" SKU) → **trust bar** (4 icons: Free Guidance with every order · 67,000+ Orders Shipped · 7-day Return & Exchange · 4.9★ 2,000+ Verified Reviews) → "Crystals For Every Space" (Tumbled Stones / Clusters tabs) → **"How To Use Your Crystal"** 4-step educational block → **founder/brand story** section with team photos → **"Why TTC Exists"** (explicitly addresses the fake-crystal trust problem) → **"Real healers, Real Sessions"** (consultation/service upsell — services sold as products) → video/UGC carousel → blog teaser (3 SEO articles) → **review wall** (aggregated star rating + individual reviews with photo, reviewer name, product tagged, date) → Instagram social proof → footer (Shop / Company / Need Help / Contact / Newsletter).
- **Observation:** the homepage is doing a lot of **trust-building work**, not just merchandising — brand story, sourcing story, and an explicit "why we're not fake" section are prominent, above lower-priority sections. This is a category-specific pattern (spiritual/crystal buyers are skeptical of authenticity) that generic e-commerce homepages don't need.

**Product discovery**
- Category pages, purpose pages, crystal-name pages, and a dedicated **best-selling collection** and **new-arrivals collection** all exist as separate crawlable/filterable pages.
- A **"Crystal Quiz"** exists as a guided-discovery funnel for undecided buyers ("Not sure where to start?").

**Product cards** (as rendered in listing/carousel)
- Image, name, one-line **emotional/benefit tagline** ("For the heart learning to open again"), review count, **price shown as strikethrough MRP + discounted price**, an inline **variant/size picker directly on the card** (dropdown of all variants with price and "Sold out" state per variant) **before** going to the PDP, "Add to cart" button, and badges (BESTSELLER / NEW) on some cards.
- **Observation:** letting the user pick a variant and add to cart **directly from the listing grid** (not just the PDP) is a meaningful conversion-oriented pattern, because many of their products are near-commodity (a tumbled stone) where the size selector is the only real decision.

**Product detail pattern** (inferred from linked product pages' card data — full PDP not separately fetched)
- Multiple images, variant selector (size/quality grade, e.g., "8mm," "AAA," "Buddha," "Faceted," "Magnetic Clasp" combos), per-variant price and per-variant sold-out state, review count/rating, "Add to cart."

**Cart**
- **[OBSERVED]** Implemented as a **slide-out drawer**, not a dedicated page, with a persistent cart icon/count in the header.

**Checkout / Authentication**
- **[OBSERVED]** Standard Shopify customer-account modal: Login (email/password), "Create your account" (First name, Last name, Email, Password — **no phone at signup**), "Recover password" (email-based reset, no OTP).
- Checkout itself is off-domain (Shopify checkout), not independently inspectable, but the announcement bar confirms **COD is offered as a payment method** alongside prepaid.

**Trust elements**
- Trust bar (orders shipped count, review count/rating, return policy days, "free guidance").
- Explicit "sourced from the miners" / "hand-selected" / anti-fake-crystal messaging.
- Founder bios with named real people and credentials ("Reiki Master," "Crystal Intuitive") — domain-specific authority signal.
- Large, real review volume (4,804 reviews) with photos and reviewer names — displayed with dates, not just static testimonials.

**UX strengths**
- Multiple, purpose-built discovery paths (category / purpose / crystal-type / quiz) instead of forcing one taxonomy.
- Variant selection surfaced early (grid-level), reducing clicks for repeat/simple purchases.
- Heavy, category-appropriate trust-building content woven into the homepage, not just a "reviews" page.
- Cross-sell via curated kits at a fixed bundle price (simpler than per-item bundling logic).

**UX weaknesses**
- The "All categories" list (70+ entries) mixes true categories with product-type/shape attributes ("Egg," "Cube," "Palm stones") — this is a navigation taxonomy smell: it works because Shopify's collection model makes every tag a pseudo-category, but it will **not scale cleanly into a normalized MongoDB category tree** without deliberately separating "category" from "shape/form" as an attribute.
- Reviews are platform-wide (a specific third-party reviews app), not something we can copy structurally without adding a review-collection UX of our own (photo upload, verified-purchase check) — currently listed only as SHOULD HAVE per the brief; recommend elevating given how load-bearing reviews are for trust in this category (see Feature Matrix).
- No visible wishlist/save-for-later affordance in the fetched homepage content — cannot confirm whether it exists elsewhere on the site. **[ASSUMED gap]** — do not assume it's absent everywhere, but it is not a demonstrated pattern from this research pass.

**Useful ideas to adopt**
- Variant-first product cards for simple/near-commodity items.
- Purpose/intention as a first-class alternate taxonomy (tag-based), separate from the hierarchical category tree.
- A short, guided "quiz" as a future recommendation-engine seed.
- Bundle/kit as its own product type with a single fixed price rather than dynamic multi-item bundling logic (much lower engineering cost for v1).
- Category-specific trust content (authenticity/sourcing) as a homepage section, not just a badge.

### 2.2 cosmicdevineworldbysharenn.exlyapp.com — **[LIMITED VERIFICATION]**

**[OBSERVED]** The URL is hosted on the `exlyapp.com` subdomain, meaning it is a **storefront built on Exly**, a third-party SaaS product. **[OBSERVED]** Direct fetch of the page returned only a client-side shell (Google Tag Manager stub) with no crawlable HTML — the site renders entirely client-side, so specific navigation, product cards, cart, or checkout details **cannot be confirmed from this research pass** and must not be treated as verified.

**[ASSUMED, based on independently verified general Exly platform capabilities, not this specific storefront]** Exly-based sites are built around:
- Selling **bookable time-based offerings**: live classes/batches, recorded courses, 1:1 consultations/appointments, workshops, and downloadable content — not a SKU/variant/stock physical-product catalog.
- A scheduler/calendar-driven booking flow rather than an "add to cart → checkout" flow for physical goods.
- Automated confirmation/reminder messaging via email and WhatsApp.
- Lead-capture-oriented landing pages rather than deep multi-category product taxonomies.
- Payment collection through the platform's own integrated gateway (not something we would replicate — Razorpay is already specified for our build).

**Why this matters for this project:** this reference is **only partially applicable**. It is useful as a signal that **spiritual/coaching businesses in this niche commonly bundle consultations/readings alongside physical products** (talktocrystals itself does this — see "Real Healers, Real Sessions" in 2.1). It is **not** a useful source for physical-product catalog UX, variant modeling, cart/checkout patterns, or admin patterns, because its entire business model is different (services/bookings vs. physical inventory).

**Recommendation:** do not attempt to structurally copy anything from this reference beyond the conceptual note that "sessions/consultations as a purchasable service" is a plausible **future product type** (see Section 18, Future-Proofing — "service/consultation" as a product type extension). Treat this as the only defensible, non-hallucinated takeaway from this reference.

⚠️ **RECOMMENDATION: CHANGE THIS (research scope):** if consultation/session-booking is actually part of the vision (not just accidentally included as a reference), that should be stated explicitly as a requirement now, because it changes the Product/Order data model (time slots, practitioner assignment, calendar availability) in ways that are materially different from physical-goods e-commerce. As currently scoped, this report treats it as **NOT REQUIRED now / FUTURE FEATURE**.

---

## 3. Recommended Product Taxonomy

The research shows the anti-pattern to avoid: flattening "category," "shape/form," "material/crystal-type," and "purpose/intention" into one list (talktocrystals' 70-item "All categories" dropdown mixes all four). Recommend **one hierarchical category tree** for navigation/URLs, plus **two independent attribute-tag systems** for cross-cutting discovery.

```text
Main Category (hierarchical, drives /category/[slug] URLs)
 ├── Crystals & Gemstones
 │    ├── Tumbled Stones
 │    ├── Rough Stones
 │    ├── Clusters
 │    ├── Geodes & Mineral Specimens
 │    └── Crystal Kits (bundles)
 ├── Jewelry
 │    ├── Bracelets
 │    ├── Pendants
 │    ├── Rings
 │    └── Necklaces / Malas
 ├── Shapes & Figures
 │    ├── Spheres
 │    ├── Pyramids
 │    ├── Towers / Points
 │    └── Idols (Ganesha, Buddha, deities)
 ├── Astrology & Rudraksha
 │    ├── Rudraksha Beads/Malas
 │    └── Gemstones by Rashi/Planet
 ├── Home & Decor
 │    ├── Crystal Grids / Charging Plates
 │    └── Decor Pieces
 └── Spiritual Accessories
      ├── Pendulums
      └── Sage / Cleansing Tools
```

Cross-cutting **attribute tags** (not part of the URL category tree, used as filters/collections):
- **Shop by Crystal/Material** (Amethyst, Rose Quartz, Citrine, …) — a tag on the product, many-to-many.
- **Shop by Purpose/Intention** (Love, Protection, Abundance, Health, Focus, Meditation, Creativity) — a tag on the product, many-to-many.

**Why separate these:** a single "Amethyst Bracelet" product should appear under Category = Jewelry → Bracelets, Material tag = Amethyst, Purpose tags = Meditation + Calm. Modeling purpose/material as **categories** (as the 70-item dropdown effectively does) would force one product into many category memberships and break clean breadcrumbs/canonical URLs (bad for SEO — see Section 9). Modeling them as **tags/attributes** keeps the category tree clean and the filters flexible.

This does not need to be the final list — it is a recommended starting taxonomy, fully editable through the admin category manager as required in the brief.

---

## 4. Feature Matrix

| Feature | Reference | Our Platform | Priority | Reason |
|---|---|---|---|---|
| Hierarchical category tree | talktocrystals (partially — mixed with tags) | Clean hierarchy, admin-managed | MUST HAVE | Core navigation + SEO URL structure |
| Purpose/Intention tag browsing | talktocrystals | Yes, as attribute tags | SHOULD HAVE | Strong differentiator in this vertical, low engineering cost |
| Shop-by-material tag browsing | talktocrystals | Yes, as attribute tags | SHOULD HAVE | Matches how customers actually search ("amethyst") |
| Variant-level price & stock | talktocrystals | Yes — variant is the pricing/inventory unit | MUST HAVE | Near-universal pattern for this product type; brief's "flexible attributes" language needs to be explicit about this |
| Product-card variant picker (pre-PDP) | talktocrystals | Yes, optional per product | SHOULD HAVE | Reduces friction for simple/commodity SKUs; skip for complex products (many images/specs) |
| Cart as slide-out drawer + dedicated `/cart` page | talktocrystals (drawer only) | Both: drawer for quick add, full page for review | SHOULD HAVE | Drawer = speed; full page = needed for edits, coupons, shipping estimate |
| Curated fixed-price kits/bundles | talktocrystals | Yes, modeled as a product type, not dynamic bundling | MUST HAVE | Explicitly requested ("Crystal Kits"); simplest correct implementation |
| Reviews with photo + verified purchase | talktocrystals | Yes | SHOULD HAVE (elevated from brief's "if implemented") | Category-specific trust driver; authenticity concerns are explicit in this market |
| Founder/brand story + sourcing trust section | talktocrystals | Yes, CMS-editable homepage block | SHOULD HAVE | Directly addresses "is this a real crystal" skepticism |
| Trust bar (orders shipped, rating, return policy) | talktocrystals | Yes, admin-configurable | SHOULD HAVE | Cheap to build, high conversion value |
| Guided "quiz" / recommendation funnel | talktocrystals | No (v1) | FUTURE FEATURE | Needs a recommendation/rules engine; not core to launch |
| Consultation/session as sellable product | talktocrystals + Exly (both) | No (v1) | FUTURE FEATURE / NOT REQUIRED NOW | Different data model (scheduling); explicitly out of current scope unless client says otherwise |
| COD payment option | talktocrystals (prominent) | Not in original brief — **recommended addition** | SHOULD HAVE | Dominant trust-building payment method in Indian D2C spiritual-goods market; architecture should support it even if launch starts Razorpay-only |
| Wishlist | Not confirmed on either reference | Yes, per brief | SHOULD HAVE | Explicitly requested; low complexity |
| Admin role separation (super admin vs staff) | Not applicable (Shopify has this natively) | Yes — recommended addition | MUST HAVE | Brief specifies one admin panel with no roles; single shared credential is a security risk |
| Multi-taxonomy browse (category+purpose+material) | talktocrystals | Yes (see Section 3) | MUST HAVE | Confirmed pattern; must be modeled correctly (tags, not categories) |
| Blog/SEO articles | talktocrystals | Yes, simple CMS | NICE TO HAVE (v1) / SHOULD HAVE (v2) | Strong SEO value, not launch-blocking |
| Announcements bar | talktocrystals (shipping/COD banner) | Yes, per brief, admin-managed | MUST HAVE | Already required; confirmed as a real, valuable pattern |

---

## 5. Client-Side Sitemap

```text
/
/shop
/category/[slug]
/collection/purpose/[slug]        (purpose/intention tag pages)
/collection/crystal/[slug]        (material tag pages)
/product/[slug]
/cart
/checkout
/checkout/address
/order/success
/order/failed
/wishlist
/profile
/profile/orders
/profile/orders/[id]
/profile/addresses
/profile/settings
/login
/signup
/forgot-password
/reset-password
/about
/contact
/feedback
/policies/shipping
/policies/returns-refunds
/policies/terms
/policies/privacy
/search?q=
```

Changes vs. the brief's suggested sitemap: added `/collection/purpose/[slug]` and `/collection/crystal/[slug]` (from taxonomy research), `/checkout/address` as a distinct step (needed because address collection is non-trivial per Section 9 of the brief), `/reset-password` (the brief mentions password reset but the sitemap omitted it), `/search`, and a `/policies/*` group (legally necessary for a payment-accepting Indian e-commerce site — Razorpay itself requires a merchant to publish shipping/refund/terms/privacy pages before go-live).

⚠️ **RECOMMENDATION: CHANGE THIS (gap in brief):** the original brief's sitemap has no policy pages. **Razorpay's merchant onboarding and RBI/consumer-protection compliance require published Shipping, Refund/Cancellation, Terms, and Privacy policy pages** on a live payment-accepting site. This is not optional — add it now so admin/content structures account for it from day one.

---

## 6. Admin Sitemap

```text
/admin/login
/admin/dashboard
/admin/products
/admin/products/new
/admin/products/[id]
/admin/categories
/admin/categories/[id]
/admin/orders
/admin/orders/[id]
/admin/users
/admin/users/[id]
/admin/feedback
/admin/feedback/[id]
/admin/announcements
/admin/announcements/new
/admin/audit-logs
/admin/staff                     (NEW — admin/role management)
/admin/settings
```

⚠️ **RECOMMENDATION: CHANGE THIS:** add `/admin/staff` for role management (super admin creates/limits staff-admin accounts with scoped permissions: e.g., a support-staff role that can view/update orders and feedback but cannot change prices, stock, or delete products). The brief describes rich admin capabilities (price changes, stock changes, user deletion) but only one undifferentiated "admin" concept — that is a **broken access control risk** the moment more than one person operates the panel, which is realistic even for a small team.

---

## 7. User Journeys

### 7.1 New user → purchase (happy path)
```text
Landing → Browse (category/purpose/crystal) → Product detail → Select variant
 → Add to Cart (or Buy Now) → Cart review → Checkout (guest or account)
 → Enter address → Order summary (server-recalculated) → Razorpay checkout
 → Payment → Server-side signature verification → Order status = PAID/CONFIRMED
 → Order confirmation page → (if account) visible in /profile/orders
```

### 7.2 Google OAuth login
```text
Click "Continue with Google" → Google consent → callback to backend
 → backend verifies Google token server-side → find-or-create User
 (provider=google, emailVerified=true because Google verified it)
 → issue session → redirect to prior page / profile
```

### 7.3 Email/password signup
```text
Signup form (name, email, password) → backend validates + hashes password
 → create User (provider=local, emailVerified=false)
 → issue session immediately (no mandatory verification per brief)
 → user can shop/checkout immediately
 → (optional, future) "verify your email" banner shown, non-blocking
```

### 7.4 Returning user purchase
```text
Login → saved addresses shown at checkout (select or add new)
 → rest of flow same as 7.1, skipping address re-entry
```

### 7.5 Guest checkout (recommended addition — see Section 12)
```text
Add to Cart → Checkout without login → enter contact + address
 → order created against a guest identity (email/phone, no User record required)
 → optional "create account to track this order" prompt post-purchase
```
⚠️ **RECOMMENDATION: CHANGE THIS (gap in brief):** the brief's checkout section implies account-based checkout but never explicitly states whether guest checkout is allowed. Forcing account creation before purchase is a well-documented conversion killer in D2C. Recommend **guest checkout as SHOULD HAVE for v1**, with post-purchase account-linking by email match.

### 7.6 Failed payment
```text
Razorpay checkout opened → payment fails/cancelled at gateway
 → Razorpay callback indicates failure OR user closes modal
 → Order remains/moves to PAYMENT_FAILED (never marked PAID without verified signature)
 → User shown /order/failed with "Retry Payment" (re-opens Razorpay for the same pending order, does not create a duplicate order)
```

### 7.7 Out-of-stock product
```text
Product/variant stock = 0 → PDP shows "Out of Stock", Add to Cart/Buy Now disabled for that variant
 → if already in someone's cart when stock hits 0 → checkout re-validates stock server-side
 → if unavailable at checkout time → block checkout for that line item, show clear message, do not silently drop or silently charge
```

### 7.8 Cancelled order
```text
User or Admin initiates cancellation → only allowed in valid pre-shipment states
 → if payment was captured → trigger refund workflow (Razorpay refund API) → order → REFUNDED
 → if not yet paid → order → CANCELLED directly
 → stock is released back to available inventory
 → audit log entry created
```

### 7.9 Admin order processing
```text
New PAID order appears in /admin/orders (dashboard "recent orders" + "pending orders" widgets)
 → Admin opens order → verifies details → updates status PAID → CONFIRMED → PROCESSING → SHIPPED (with tracking info if available) → DELIVERED
 → each transition writes an AdminAuditLog entry
 → invalid transitions (e.g., DELIVERED → PENDING_PAYMENT) are rejected server-side
```

---

## 8. Database Architecture (MongoDB)

**Design principles:** money/stock fields are the source of truth on the server only; every write to price/stock/order-status happens through a service layer that validates state transitions; use MongoDB **multi-document transactions** (replica-set/Atlas required) for the order-creation + stock-decrement sequence, because these must be atomic.

### Core collections

**User**
```text
_id, name, email (unique, lowercased), passwordHash (nullable if OAuth-only),
authProvider: "local" | "google" | "both",
googleId (nullable, unique sparse),
emailVerified: boolean (default false for local signups, true for google),
roles: ["customer"] (admins live in a separate AdminUser collection — see below),
status: "active" | "blocked" | "deleted",
defaultAddressId,
createdAt, updatedAt, lastLoginAt
```
⚠️ **RECOMMENDATION: CHANGE THIS:** keep `AdminUser` as a **separate collection/model from `User`**, not a role flag on the same collection. Mixing customer auth and admin auth in one collection/model increases the blast radius of any authorization bug (a bug that fails to check role now exposes admin-equivalent access through the customer session code path). Separate models, separate session scopes, separate login endpoints.

**AdminUser** (NEW — not explicit in brief, required to satisfy the brief's own "role separation" gap)
```text
_id, name, email (unique), passwordHash, role: "super_admin" | "staff",
permissions: [ "products:write", "orders:write", "orders:read", "users:write", ... ] (only for staff; super_admin implicitly has all),
status: "active" | "disabled",
lastLoginAt, createdAt
```

**Category**
```text
_id, name, slug (unique), description, imageUrl (Cloudinary ref),
parentId (nullable, self-reference for subcategories),
status: "active" | "inactive",
seoTitle, seoDescription, sortOrder, isFeatured,
createdAt, updatedAt
```
Index: `{ slug: 1 }` unique, `{ parentId: 1, sortOrder: 1 }`.

**Tag** (NEW — implements Section 3's purpose/material taxonomy)
```text
_id, type: "purpose" | "material" | "shape" | "custom",
name, slug (unique per type), imageUrl, sortOrder, isFeatured
```

**Product**
```text
_id, name, slug (unique), shortDescription, fullDescription,
categoryId, tagIds: [ObjectId] (Tag references),
images: [{ publicId, secureUrl, alt, sortOrder }],
specifications: [{ label, value }]  // flexible key-value list, NOT a rigid schema
careInstructions,
badges: { isFeatured, isBestseller, isNewArrival },
status: "draft" | "active" | "archived",
seoTitle, seoDescription, canonicalSlug,
ratingAverage, ratingCount,        // denormalized, updated on review write
createdAt, updatedAt
```
**Variants live in a separate sub-array or a separate collection — see decision box below.**

Decision: **`ProductVariant` as an embedded array inside `Product`** (not a separate collection), because:
- Variants are always read together with the product (PDP, cards) — embedding avoids extra queries.
- Variant count per product is small (tens, not thousands) — safe for MongoDB's document size limits.
- Stock decrements can target `products.variants.$[elem].stock` atomically with `arrayFilters`, which is sufficient for this scale; a separate collection would only be justified at very high write-concurrency (flash-sale scale), which is explicitly out of scope per the "no premature microservices" instruction.

```text
Product.variants: [{
  variantId (uuid, stable even if product edited),
  label,                  // "8 to 8.5mm", "AAA", "Buddha Charm" etc — free text, admin-defined
  attributes: { size, material, weight, dimensions, ... }  // flexible map, matches brief's per-category attribute need
  mrp, sellingPrice,
  stock, stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unavailable",
  sku (unique),
  isDefault: boolean
}]
```
This directly satisfies the brief's requirement that "different products may have different specifications... without creating a separate database model for every product type" — `attributes` is a free-form map, `specifications` on the parent product covers descriptive (non-purchasable-affecting) specs.

Indexes: `{ slug: 1 }` unique, `{ categoryId: 1, status: 1 }`, `{ tagIds: 1 }`, `{ "badges.isFeatured": 1 }`, `{ "variants.sku": 1 }` unique sparse, text index on `{ name, shortDescription }` for basic search (see Section 13 on when to graduate to real search infra).

**Cart**
```text
_id, userId (nullable — guest carts keyed by a signed cookie/session id instead),
items: [{ productId, variantId, quantity, priceSnapshotAtAdd }],  // priceSnapshotAtAdd is informational only, NEVER trusted at checkout
updatedAt, expiresAt (TTL index for abandoned guest carts)
```

**Address**
```text
_id, userId, label, fullName, phone,
line1, line2, landmark, city, state, pincode, country (default "India"),
isDefault
```

**Order**
```text
_id, orderNumber (human-readable, sequential/unique),
userId (nullable for guest),
guestContact: { name, email, phone } (only if userId is null),
items: [{ productId, productNameSnapshot, variantId, variantLabelSnapshot,
          quantity, unitPriceSnapshot, mrpSnapshot }],   // full snapshot, immutable after order creation
subtotal, discountTotal, shippingCharge, taxTotal, grandTotal,   // all computed server-side, never accepted from client
addressSnapshot: {...},          // copy of address at time of order, address book may change later
orderNote,
status: "PENDING_PAYMENT" | "PAYMENT_FAILED" | "PAID" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
paymentId (ref to Payment),
createdAt, updatedAt,
statusHistory: [{ status, changedBy, changedAt }]
```
Index: `{ userId: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }` (for admin dashboard "pending orders"), `{ orderNumber: 1 }` unique.

**Payment**
```text
_id, orderId, razorpayOrderId, razorpayPaymentId (nullable until success),
razorpaySignature (stored only for audit, never trust it without server-side HMAC re-verification),
amount, currency, status: "created" | "authorized" | "captured" | "failed" | "refunded",
rawWebhookPayload (optional, for dispute resolution — store minimal necessary fields, never full card data; Razorpay is PCI-compliant and tokenized, we never see card numbers)
createdAt, updatedAt
```

**Review**
```text
_id, productId, userId (nullable if allowing post-purchase-token reviews without login — decide at build time),
orderId (to support "verified purchase" badge),
rating (1-5), title, body, images: [Cloudinary refs],
status: "pending" | "approved" | "rejected",   // moderation queue, prevents spam/abuse
createdAt
```

**Wishlist**
```text
_id, userId, productIds: [ObjectId], updatedAt
```

**Feedback**
```text
_id, userId (nullable), category: "feedback" | "complaint" | "product_issue" | "website_issue" | "order_issue" | "other",
message, relatedOrderId (nullable), relatedProductId (nullable),
status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED",
createdAt, updatedAt
```

**Announcement**
```text
_id, message, type: "info" | "promo" | "maintenance",
isActive, startAt, endAt, createdAt
```
Index: `{ isActive: 1, startAt: 1, endAt: 1 }` (small collection; querying "currently active" announcements is cheap and can be cached — see Section 14).

**AdminAuditLog**
```text
_id, adminId, adminEmailSnapshot, action, targetType, targetId,
metadata: {...}  (e.g., { field: "price", from: 499, to: 599 }),
ipAddress, createdAt
```
Never log passwords, tokens, or full payment payloads here.

### Cross-cutting DB notes
- **Do not over-index** (per brief instruction): the indexes above map to concrete, stated query patterns (slug lookup, category browse, dashboard "recent/pending orders," user order history, unique SKU/order-number enforcement). Add more only when a real slow query is observed.
- **Soft deletion**: `Product.status = "archived"`, `Category.status = "inactive"`, `User.status = "deleted"` (with PII fields nulled/hashed on deletion — see Section 12) rather than physical document deletion, to preserve `Order` referential/audit integrity. This resolves the brief's own tension between "delete order/user" and "financial records must remain auditable."

---

## 9. API Architecture

Layered structure per brief: `routes → controllers → services → repositories → models`, plus `middlewares`, `validators`, `utils`, `config`. Middleware pipeline order matters: request-id → rate limiter → auth (session parse) → role/permission check → input validation → controller.

| Endpoint (representative, not exhaustive) | Method | Auth |
|---|---|---|
| `/api/categories` | GET | Public |
| `/api/products` (filters: category, tag, price range, availability, sort, page) | GET | Public |
| `/api/products/:slug` | GET | Public |
| `/api/cart` | GET/POST/PATCH/DELETE | Public (session or guest-cart token) |
| `/api/checkout/summary` | POST (cart/selection in, server-computed totals out) | Public/customer |
| `/api/orders` | POST (creates PENDING_PAYMENT order) | Customer or guest |
| `/api/orders/:id` | GET | Owner or admin |
| `/api/payments/razorpay/order` | POST (creates Razorpay order server-side) | Customer/guest, tied to an existing PENDING_PAYMENT order |
| `/api/payments/razorpay/verify` | POST (verifies signature, updates order+payment status) | Same as above |
| `/api/payments/razorpay/webhook` | POST | **Razorpay only**, verified via webhook secret, no session — this is the source of truth, frontend confirmation is UX-only |
| `/api/auth/google/callback` | GET | N/A (OAuth handshake) |
| `/api/auth/signup` / `/api/auth/login` / `/api/auth/logout` | POST | Public / session |
| `/api/auth/forgot-password` / `/api/auth/reset-password` | POST | Public (rate-limited hard) |
| `/api/profile/orders`, `/api/profile/addresses`, `/api/wishlist` | GET/POST | Customer session required |
| `/api/admin/products` (CRUD) | * | Admin session + `products:write`/`products:read` |
| `/api/admin/orders/:id/status` | PATCH | Admin session + `orders:write`, validated state machine |
| `/api/admin/dashboard/stats` | GET | Admin session, aggregation-pipeline backed, cached (Section 14) |
| `/api/admin/audit-logs` | GET | Admin session, `super_admin` only |

⚠️ **RECOMMENDATION: CHANGE THIS (critical, brief under-specifies this):** the **Razorpay webhook endpoint must exist and must be the authoritative payment-confirmation path**, not just the frontend-initiated "verify" call. Relying only on the client calling `/verify` after checkout means a user who closes the browser mid-flow after a successful payment can leave an order stuck in `PENDING_PAYMENT` forever, or — worse — a manipulated client could skip the call entirely. The webhook (server-to-server, signed with a webhook secret Razorpay provides) is what makes payment status trustworthy regardless of client behavior.

---

## 10. Authentication Architecture

- **Google OAuth**: standard authorization-code flow; backend exchanges code for tokens server-side, verifies the ID token, upserts `User` with `authProvider: google`, `emailVerified: true` (Google has already verified the email — this is a legitimate case where `emailVerified=true` is safe to set automatically).
- **Email/password**: bcrypt/argon2 password hashing (never reversible, never logged), `emailVerified: false` at creation, **no OTP**, **no mandatory verification step blocking login/checkout**, per brief. The `emailVerified` flag is preserved so a future verification feature can be layered on without a schema change.
- **Sessions**: server-side session (e.g., signed, HttpOnly, `Secure` in production, `SameSite=Lax` or `Strict`) — recommend **not** storing a long-lived JWT in `localStorage`/JS-accessible storage, since that is vulnerable to XSS token theft; an HttpOnly cookie-backed session is the safer default the brief already implies ("HttpOnly cookies where appropriate").
- **CSRF**: since auth is cookie-based, CSRF protection (double-submit token or `SameSite` cookie policy) is mandatory for all state-changing endpoints.
- **Password reset**: email-with-signed-time-limited-token link (no OTP, per brief) — token single-use, short expiry (e.g., 30-60 minutes), invalidate all existing sessions on password change.
- **Rate limiting / brute force**: per-IP and per-account rate limits on `/login`, `/signup`, `/forgot-password`; exponential backoff or temporary lockout after repeated failures; the brief explicitly asks for this and it is **especially important given no-OTP means password is the only factor**.
- **Admin authentication**: separate login route (`/admin/login`), separate session scope/cookie name from customer sessions, `AdminUser` collection as described in Section 8, mandatory strong-password policy, recommend admin-side 2FA/TOTP as **SHOULD HAVE even though not explicitly requested**, because admin compromise is a much higher-impact event than a customer account compromise (price/stock manipulation, order data exposure).

⚠️ **RECOMMENDATION: CHANGE THIS:** the brief explicitly excludes OTP for customers, which is acceptable, but it says nothing about **admin** 2FA. Given the admin panel controls pricing, stock, and order data, recommend TOTP-based 2FA for `AdminUser` as a SHOULD HAVE for launch, not a future feature — the cost to add (a standard TOTP library) is low relative to the risk it mitigates.

---

## 11. Payment Architecture (Razorpay)

```text
1. Customer confirms checkout → backend creates Order (status=PENDING_PAYMENT) with server-computed totals
2. Backend calls Razorpay Orders API (server-side, using secret key) → gets razorpay_order_id
3. Frontend opens Razorpay Checkout with razorpay_order_id + Razorpay key_id (public key only)
4. Customer pays → Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature to frontend
5. Frontend sends these three values to backend /verify endpoint
6. Backend recomputes HMAC-SHA256 signature using the Razorpay secret and compares — this is the ONLY trusted confirmation
7. In parallel/redundantly: Razorpay also sends a server-to-server webhook (payment.captured) — backend verifies webhook signature independently and reconciles order status
8. Only after (6) or (7) succeeds does Order move to PAID; UI success page is shown, but is not itself a source of truth
```

- Razorpay **key secret** and **webhook secret** live only in backend environment variables, never sent to frontend, never committed to source control.
- Idempotency: verifying the same payment twice (e.g., webhook arrives after the frontend call already confirmed it) must not double-fulfil or double-log — key on `razorpay_payment_id` uniqueness.
- Refunds: initiated by admin action → call Razorpay Refunds API server-side → order status `REFUNDED` only after Razorpay confirms, not optimistically.

---

## 12. Security Threat Model

| Threat | Mitigation |
|---|---|
| Client-supplied price/discount/total tampering | All totals recalculated server-side at order creation and again at payment verification; client values are never persisted as authoritative |
| Fake "payment successful" from a manipulated frontend | Razorpay signature verification + webhook reconciliation (Section 11); order never marked PAID from a client claim alone |
| IDOR (e.g., `/api/orders/:id` guessing) | Ownership check on every order/address/wishlist read (`order.userId === session.userId` or matching guest token), plus admin-only bypass explicitly gated by role |
| Broken access control on admin routes | Role/permission middleware on every admin route (not just a page-level guard); separate `AdminUser` model (Section 8); audit log on every sensitive mutation |
| NoSQL injection (e.g., unsanitized query operators in filter params) | Strict input validation/whitelisting of filter fields; never pass raw client JSON into a Mongo query without a schema-validated shape |
| XSS via product descriptions / review content | Sanitize/escape any admin- or user-submitted rich text before render; Content-Security-Policy headers |
| CSRF on state-changing requests | SameSite cookies + CSRF token on cart/checkout/admin mutations |
| Brute force on login/reset | Rate limiting + lockout/backoff (Section 10); this is more important here because there is no OTP second factor for customers |
| Malicious file upload (product images, review photos) | Validate MIME type + magic bytes (not just extension), enforce size limits, upload through Cloudinary's validated pipeline, never accept arbitrary file execution paths |
| Mass assignment (e.g., a signup request also setting `role: admin` or `emailVerified: true`) | Explicit allow-listing of writable fields per endpoint/DTO — never `Object.assign(user, req.body)` style patterns |
| Session fixation/hijacking | Regenerate session ID on login/privilege change; HttpOnly+Secure+SameSite cookies |
| Sensitive data leakage in error responses | Generic error messages to clients; full stack traces only in server logs, never in API responses |
| Admin credential compromise | Recommend TOTP 2FA for admin (Section 10), audit log, and role separation to limit blast radius |
| Order/user hard-deletion destroying financial audit trail | Soft-delete/anonymize per Section 8, not physical delete |
| Abuse of no-OTP signup (bot account creation, fake orders/COD abuse if COD is added) | CAPTCHA on signup, rate limiting, and — if COD is implemented — phone-based COD order confirmation as a compensating control even without full OTP-gated signup |
| Webhook spoofing | Verify Razorpay webhook signature using the webhook secret on every inbound webhook call; reject unsigned/invalid requests |

---

## 13. Scalability Plan

- Start **modular monolith** (routes/controllers/services in one deployable backend on Render), per brief's explicit instruction not to introduce microservices prematurely.
- **Database**: MongoDB Atlas (or equivalent managed MongoDB with replica set, required for multi-document transactions used in order+stock atomicity), connection pooling tuned to Render's instance size, projection-limited queries (never `find({})` without field selection on large collections).
- **Search**: MongoDB text index is sufficient at launch catalog sizes (hundreds to low thousands of SKUs). Graduate to a dedicated search service (e.g., Atlas Search or an external engine) only when catalog size, filter complexity, or query latency actually demands it — not preemptively.
- **Caching**: category tree, active announcements, and homepage "featured/bestseller" product lists change infrequently relative to how often they're read — good first candidates for a short-TTL cache (in-memory at low scale; Redis only once running more than one backend instance, since in-memory cache won't be shared across instances).
- **Background jobs**: not required at launch (no heavy async work yet); introduce a queue only when adding email/WhatsApp notifications, abandoned-cart recovery, or bulk exports (Section 18).
- **Rate limiting**: applied at the API layer from day one (not deferred), since it's also a core security control (Section 12).
- **Horizontal scaling readiness**: keep the backend stateless (sessions in a shared store, not in-process memory) so it can scale to multiple Render instances later without a redesign.

---

## 14. Performance Plan

- **Rendering**: server-side rendering (or static generation with revalidation) for `/`, `/shop`, `/category/[slug]`, `/product/[slug]` — these need to be fast and crawlable for SEO; client-side rendering is acceptable for `/cart`, `/checkout`, `/profile/*` (behind auth, not indexed).
- **Images**: all product/category imagery served through Cloudinary's transformation/CDN pipeline (responsive sizes, WebP/AVIF where supported, lazy-loaded below the fold).
- **Database query efficiency**: pagination on all listing endpoints (never unbounded `find`), field projection (don't return `fullDescription`/`specifications` on list views), aggregation pipelines for dashboard stats computed with `$match`/`$group` rather than pulling raw documents into application code.
- **API caching**: short-TTL cache for category tree, homepage featured sections, active announcements (Section 13).
- **Core Web Vitals**: keep JS bundle lean on the storefront, avoid heavy animation libraries (brief explicitly warns against over-animating), preconnect/preload for Cloudinary and Razorpay checkout script.
- **Admin dashboard**: must not compute stats by loading full collections into memory — use `$count`, `$group`, and indexed date-range queries (brief explicitly calls this out; confirmed as a real risk given `Order`/`User` collections will be the largest).

---

## 15. Testing Strategy

- **Unit tests**: pricing/discount calculation, stock-decrement logic, order state-machine transition rules, password hashing/verification.
- **Integration tests**: full checkout flow against a test database (cart → order → mock Razorpay order → mock verification → status update).
- **API tests**: contract tests per endpoint (auth required/not required, expected status codes, validation error shapes).
- **Authentication/authorization tests**: verify a customer session cannot access another customer's order (IDOR check), verify a `staff` admin without `products:write` cannot mutate products, verify expired/invalid sessions are rejected.
- **Payment tests**: Razorpay provides a test mode/sandbox — test both signature-verification success and deliberate signature-mismatch (must reject), and webhook replay/idempotency.
- **Database tests**: transaction rollback behavior when stock is insufficient mid-order-creation.
- **UI/responsive tests**: manual or automated (e.g., Playwright) checks across mobile/tablet/desktop breakpoints for product cards, filters, cart drawer, checkout form, admin tables (brief explicitly calls out testing these on small screens).
- **Security tests**: basic automated scanning (dependency vulnerability scan, header checks) plus manual IDOR/role-escalation testing before launch.
- **Load testing**: focus on the checkout + payment-verification path and the product-listing/homepage path, since those are the two traffic-critical paths; do this against a staging environment, not production.

---

## 16. Error Handling Strategy

- Consistent API error envelope, e.g. `{ error: { code, message, details? } }`, with a **stable machine-readable `code`** (e.g., `OUT_OF_STOCK`, `INVALID_COUPON`, `PAYMENT_VERIFICATION_FAILED`) that the frontend can branch on, separate from the human-readable `message`.
- Never leak stack traces, internal file paths, or raw database errors to the client — log them server-side with a request-id, return a generic message + that request-id to the user for support reference.
- Distinguish **validation errors** (400, safe to show field-level detail) from **authorization errors** (401/403, generic message, no detail about *why* to avoid enumeration) from **server errors** (500, fully generic).
- Checkout-specific: if stock/price changed between cart-add and checkout, return a specific, actionable error (e.g., "This item's price has changed" / "Only 2 left in stock") rather than a generic failure.

---

## 17. Monitoring & Observability

- **Structured logs**: JSON logs with request-id, user/admin id (not PII beyond that), route, status code, latency — shippable to a log aggregator.
- **Error tracking**: an error-tracking service (e.g., Sentry-class tool) wired into the backend to catch unhandled exceptions with stack traces server-side only.
- **Health checks**: a `/health` endpoint (DB connectivity check) for Render's health monitoring/auto-restart.
- **Database monitoring**: slow-query logging, connection pool utilization (available via MongoDB Atlas monitoring if hosted there).
- **API latency monitoring**: track p50/p95/p99 for checkout and product-listing endpoints specifically, since those are the highest-impact paths.
- **Payment monitoring**: alert on Razorpay webhook failures, signature-mismatch spikes (possible attack), and orders stuck in `PENDING_PAYMENT` beyond a reasonable window (possible stuck/abandoned flow needing reconciliation).
- **Security alerts**: alert on repeated failed-login spikes (possible brute force), repeated 403s from the same account/IP (possible privilege-escalation probing).

---

## 18. Future-Proofing

Architecture should not block these, but none are required now:

- **Coupons/discount codes** — add a `Coupon` collection and a discount-resolution step in the checkout-summary service; the order schema's `discountTotal` field already anticipates this.
- **Reviews** — schema already included (Section 8) as SHOULD HAVE; moderation queue is future-extensible to auto-moderation.
- **Wishlist** — schema already included.
- **Email notifications** (order confirmation, shipping updates) — introduce a background job queue once this is added; don't send email synchronously inside the checkout request path.
- **WhatsApp notifications** — same as above, via a provider integration, queued.
- **Shipping integration** (courier API, tracking numbers) — add a `shipment` sub-document on `Order` when this is built; `SHIPPED` status already anticipates a tracking reference field.
- **Refund automation** — Razorpay Refunds API is already the target integration point (Section 11); "automation" just means triggering it on defined rules instead of manual admin action.
- **Inventory management** (batch import, low-stock alerts to admin) — dashboard already surfaces low/out-of-stock (brief requirement); alerting/automation layers on top later.
- **Multiple admins / role-based permissions** — **brought forward from future to MUST HAVE now** (Section 6/10) because the risk of a single shared admin credential is immediate, not deferred.
- **Advanced analytics** — build on the same aggregation-pipeline patterns used for the dashboard; add a dedicated analytics store only if query load on the primary DB becomes a problem.
- **Search engine** (typo-tolerant, faceted) — graduate from MongoDB text index when catalog size/complexity justifies it (Section 13).
- **Recommendation engine** — the `tagIds` (purpose/material) already give a cheap "similar products" query (same tags, same category) as a v1 "related products" feature; a real ML recommender is a legitimate future upgrade.
- **Abandoned cart recovery** — `Cart.expiresAt`/TTL and `updatedAt` already give the data needed to identify abandoned carts once email/notification infra exists.
- **GST/invoice support** — add invoice-number sequencing and tax breakdown fields to `Order` when formal GST invoicing is required; `taxTotal` field already exists as a placeholder.
- **Product variants** — already core to v1 (Section 3/8), not deferred.
- **Multi-language / multi-currency** — would require i18n content fields and currency-aware pricing; explicitly deferred, not designed against now beyond avoiding hardcoded English strings in core logic where cheap to avoid.
- **Consultation/session-as-product** (from Section 2.2's Exly observation) — would require a scheduling/availability data model fundamentally different from physical-goods inventory; explicitly out of scope unless the client confirms this is actually part of the vision.

---

## Appendix: Summary of "RECOMMENDATION: CHANGE THIS" Items

1. Model variants as the pricing/inventory unit explicitly, not an afterthought attribute (Sections 3, 8).
2. Add COD as at least an architecturally-supported payment method, given its prominence in the directly comparable competitor (Sections 1, 4).
3. Define soft-delete/anonymization for `User`/`Order` before schema design, to resolve the brief's own contradiction between "allow deletion" and "keep financial records auditable" (Sections 1, 8).
4. Add explicit compensating controls (rate limiting, CAPTCHA, lockout) for the no-OTP/no-mandatory-verification auth model (Sections 10, 12).
5. Add role separation (`super_admin` vs `staff` with scoped permissions) as MUST HAVE, not implied-only, given the brief grants the single "admin" concept very broad power (Sections 6, 10, 18).
6. Add published policy pages (`/policies/*`) to the sitemap — required for Razorpay merchant compliance, missing from the brief's proposed sitemap (Section 5).
7. Make the Razorpay **webhook** the authoritative payment-confirmation path, not just the client-initiated verify call (Section 9).
8. Recommend admin-side TOTP 2FA as SHOULD HAVE at launch, not future, given the admin panel's control over pricing/stock/orders (Section 10).
9. Keep `AdminUser` as a fully separate model/collection from `User`, not a role flag, to reduce blast radius of authorization bugs (Section 8).
10. Elevate Reviews from "if implemented" to SHOULD HAVE, given how load-bearing authenticity/trust signals are in this specific product category (Sections 1, 4).
11. Treat "consultation/session as a sellable product" (suggested by both references, especially talktocrystals' own "Guidance Services") as an explicit, named future-feature decision point rather than something implicitly absorbed into the current physical-goods scope (Section 2.2, 18) — flag to the client for an explicit yes/no before Anti-Gravity begins modeling.

---

**End of report.** This document is intended to be handed directly to the engineering agent as the single source of truth for the initial development phase. Any deviation from the "RECOMMENDATION: CHANGE THIS" items above should be a deliberate, documented product decision, not a silent omission.
