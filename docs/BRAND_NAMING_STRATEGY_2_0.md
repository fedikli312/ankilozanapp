# Brand Naming Strategy 2.0

Status: **Proposal only. Nothing in this document has been implemented.** No production rename, bundle identifier, package name, App Store configuration, or RevenueCat identifier has changed. Naming remains a proposal until explicitly approved. Grounded in live web research (competitor App Store listings, patient search language in English and Turkish, public collision spot-checks conducted for this pass) — collision findings are explicitly **not** formal trademark clearance; a real legal/trademark/domain check is required before any commercial commitment.

**Recommendation, stated up front: rename the consumer-facing brand from "Ankilozanapp" to Ilium.** The rest of this document is the case for that, in full, plus the App Store/ASO architecture and organic-growth plan that follow from it. Internal technical naming (`DoctorReportInput`, repository/table names, etc.) may remain unchanged — this is a consumer-facing brand decision only.

---

## 1. Audit of the current name, "Ankilozanapp"

**Verdict: "Ankilozanapp" reads as an indie side-project utility, not a consumer brand — a working title that was correct for month one and is wrong for a paid, hard-paywalled subscription product asking users to trust it with chronic-illness data for years.**

| Dimension | Assessment |
|---|---|
| Memorability | Weak — a compound of a clinical-colloquial noun plus a generic suffix, nothing distinctive to hold onto. |
| Pronunciation (Turkish) | Fine — familiar to Turkish patients from doctor visits and search. |
| Pronunciation (English) | Poor — unfamiliar consonant cluster, ambiguous stress; non-Turkish speakers can't parse it from print and mentally default to "ankylosing" anyway. |
| Spelling difficulty | High in English, moderate in Turkish — breaks word-of-mouth referral. |
| Turkish-market usability | Functionally clear but reads as a description, not an identity — like naming a running app "Koşuygulama." |
| English/international usability | Poor — signals "foreign medical term + app," reducing rather than building first-encounter trust. |
| Emotional tone | Clinical-adjacent, slightly cold — names the diagnosis, not the person living with it. |
| Trust signal | Low-to-neutral — achieves neither clinical-authority framing nor warm brand-design trust. |
| Premium vs. utility perception | Reads utility, and specifically *unfinished* utility (compare "Bearable," "Visible" — utility-coded but polished). |
| Medical vs. consumer perception | Neither convincingly — too casual/compound for clinical credibility, too literal for consumer warmth. |
| App Store presentation | The condition name embedded in the brand name wastes title real estate restating a keyword the subtitle/keywords field can win at zero brand cost. |
| Word-of-mouth usability | Fails the "hey, have you tried ___" test — the name doesn't sit naturally in a spoken sentence. |
| Searchability | Its one real strength — but that value is fully recoverable via subtitle/keywords under any real brand name (see §10). |
| Direct AS/axSpA relevance | Maximal, but relevance without any other brand quality is a label, not a brand. |
| Future expansion flexibility | None — hard-locks the product to one disease and one language community; actively works against ever extending to related spondyloarthropathies, comorbid conditions, or non-Turkish markets at scale. |
| Brand defensibility | Very weak — built from the disease's own colloquial name, close to undefendable the way a distinctive coined word is not; any competing AS app in Turkey could use "ankilozan" too. |
| Logo/icon potential | Minimal — no image, metaphor, or shape latent in the word; forces designers toward generic medical-cross/spine iconography with nothing to anchor a real concept. |
| Domain/social-handle plausibility | The name's only accidental strength — a spot-check found no existing product/company/trademark collision. A low bar (most invented strings are unclaimed), and the case against the name is about what it fails to build, not legal risk. |

Every real competitor identified in this research (Rapha, Bearable, Visible, AS Log, Hurtl) uses a genuine brand name plus a descriptive subtitle — none named itself after the disease.

## 2. Organic search-language research

**English-language patient search** clusters into two distinct intents: **informational** ("ankylosing spondylitis symptoms," "axial spondyloarthritis diagnosis," "AS morning stiffness") — high volume, low install-intent, mostly served by hospital/clinic SEO content, an opportunity for a content surface rather than an ASO keyword to chase directly; and **"find a tool"** ("ankylosing spondylitis tracker," "axSpA symptom tracker," "AS symptom diary," "BASDAI tracker," "medication reminder biologic," "rheumatology appointment prep," "chronic pain tracker," "flare tracker") — lower volume, high install-intent, exactly what real competitors target in subtitle/keywords.

**"Flare"** is the single most consistent piece of patient/marketing vocabulary in this category — Hurtl's own App Store subtitle is literally "Track flares, meds & symptoms"; a standalone competitor app is named "Flare" (flarelog.app); Flaredown built its entire brand around the word. This is search/marketing-language reality, reported for ASO purposes only. **It is kept explicitly separate from what this product's own interface is allowed to claim**: the product only ever lets a user self-declare a "high-symptom day" — it never auto-detects, infers, or diagnoses a flare. Screenshot and marketing copy in §10 is written to respect that line; product UI copy is unaffected by this section.

**BASDAI/BASFI/ASDAS** (clinical disease-activity indices) recur as a feature keyword across AS-specific competitors (AS Log, Chronic Insights, Hurtl, ASAS App) — useful as a secondary keyword theme, too clinical/acronym-heavy for brand material.

**Turkish-language patient search** required going past direct translation: **"ankilozan spondilit"** is the dominant lay term (not the more clinician-facing "aksiyel spondiloartrit"). **"Sabah tutukluğu"** (morning stiffness) is a strong, recurring, deeply human phrase — the way patients actually describe the disease to others, strong raw material for copy/tagline, too descriptive for a brand name itself. An active, long-running Ekşi Sözlük thread and a real Facebook group ("Ankilozan Spondilit") confirm a genuine, findable Turkish patient community with plain, emotional language ("yarım saatten fazla oturamıyorum" — "I can't sit for more than half an hour"). **"Kaynaşma"** (fusion/adhesion — what happens to the spine in AS) is real, authentic lay vocabulary, not itself a search term, but useful naming-root material (see Territory 6). **"Romatoloji randevu hazırlık"** (rheumatology appointment prep) has essentially no dedicated Turkish patient content today — a genuine content *and* product gap, not just a keyword gap (see §11).

**Conclusion**: organic intent concentrates on functional keywords far more than on branded or awareness-style searches — the brand name itself doesn't need to, and shouldn't try to, carry the keyword load; the subtitle/keyword field should (§10).

## 3. Competitor naming pattern research

Real, currently-live App Store title/subtitle pairs:

| App | Title | Subtitle | Pattern |
|---|---|---|---|
| AS Log | "AS Log: Ankylosing Spondylitis" | "AxSpA tracker and journal" | Brand + condition : keyword subtitle |
| Rapha | "Rapha, Ankylosing Spondylitis" | "Manage AS easily" | Brand + condition : benefit subtitle |
| Hurtl | "Hurtl: Pain & Symptom Tracker App" | "Track flares, meds & symptoms" | Brand : descriptor, keyword-dense subtitle |
| Bearable | "Bearable Symptom & Med Tracker" | (fused into title) | Brand-as-common-word + descriptor |
| Visible | "Visible: Pacing for illness" | — | Brand : distinctive positioning phrase |
| Flare (flarelog.app) | "Flare" | "Chronic pain & symptom tracker" | Pure invented-feeling word, story carried outside the title |
| Flo | "Flo: Period & Cycle Health" | — | Brand : descriptor (category-defining pattern) |
| Calm | "Calm: Sleep & Meditation" | — | Brand : descriptor (category-defining pattern) |

**Pattern**: every serious player uses **brand name + a separate descriptor**, never a fully keyword-stuffed descriptive name, and never the condition spelled out as the brand. Purely descriptive listings ("Arthritis & Joint Tracker") read as the lowest-tier, most disposable results in every competitive search — exactly the register "Ankilozanapp" currently occupies.

**Recommendation: (B) a distinctive brand name + a plain descriptive subtitle**, leaning toward **(C)** where a name can carry a *subtle* AS-relevant semantic cue without spelling anything out — strictly better than a semantically empty invented word at zero cost to distinctiveness or trademarkability. Given this product has a **hard paywall**, trust and premium perception are revenue-load-bearing, not optional; Apple's search algorithm weighs the subtitle/keyword field as well as the title, so approach (A)'s only real advantage is largely recoverable under (B) anyway.

## 4. Naming territories (six explored, one added beyond the brief's four)

1. **AS/axSpA-rooted** (subtle, not literal) — roots explored: *ankylos* (fused/bent), *spondyl* (vertebra), sacroiliac anatomy, axial/spine imagery.
2. **Movement/mobility** — movement, flexibility, rhythm, posture.
3. **Personal health record/journey** — time, patterns, chapters, record, chronicle.
4. **Calm companion** — human, supportive, non-clinical. *(Empirically the highest-collision territory in this research — nearly every warm/human short English word in health branding is already claimed; itself a useful finding, reflected in the shortlist below.)*
5. **Invented/abstract brand** — short, distinctive, ownable, no medical vocabulary at all.
6. **Turkish-rooted wordplay** *(added)* — given the primary market and product origin, a name meaning something real in Turkish, without spelling out the clinical term, follows the same logic that made Oura/Flo/Calm work: an evocative root word, not a medical compound.

## 5. Candidate pool (54 names)

Filtered throughout against: pronunciation, spelling, memorability, distinctiveness, visual-identity potential, App Store appearance, English viability, Turkish viability, AS relevance where the territory calls for it, emotional fit, premium perception — and explicitly against generic AI/startup suffixes ("-ly/-ai/-mind/-flow/-buddy/-genius/-smart/-care") and against names reading as pharmaceutical, hospital, insurance, AI-assistant, or generic-SaaS.

**Territory 1 — AS/axSpA-rooted**: Ilium, Vertra, Sacra, Ossalo, Axys, Verteo, Spondia, Ankira *(rejected — too close to "Ankara")*, Kynos *(collision, §7)*, Talus *(collision, §7)*.

**Territory 2 — Movement/mobility**: Glide, Wend, Ease, Arc, Sway *(collision, §7)*, Amble *(collision, §7)*, Uncoil *(collision, §7)*, Unbend *(collision, §7)*, Rove, Pivot *(rejected — startup cliché)*.

**Territory 3 — Personal record/journey**: Marrow, Chronicle, Annals, Waypoint, Throughline *(collision, §7)*, Ledger, Almanac, Datebook *(rejected — too literal/utility)*, Signet, Recap *(rejected — too generic/media-coded)*.

**Territory 4 — Calm companion**: Vale, Elyra, Wren *(collision, §7)*, Amara *(collision, §7)*, Kindred *(collision, §7)*, Haven *(collision, §7)*, Tandem *(collision, §7)*, Sella *(collision, §7)*, Halcyon *(collision, §7)*, Fen *(rejected — too obscure)*.

**Territory 5 — Invented/abstract**: Verrin, Solume, Norema, Vessa, Loma *(collision, §7)*, Verve *(collision, §7)*, Kestra *(collision, §7)*, Auven *(collision, §7)*, Tellu *(collision, §7)*, Ilara *(collision, §7)*.

**Territory 6 — Turkish-rooted**: Kaynak, Kıvrak, Diri *(deprioritized — moderate collision with a Turkish fitness app)*, Denge *(rejected — collides with Google's own Turkish "Digital Wellbeing" branding, a severe conceptual collision)*, Reha *(rejected — saturated with literal rehabilitation apps, also reads too clinical)*.

## 6. Shortlist (10) with consistent scoring

Scored 1-5 per dimension (11 dimensions, 55 max). Only names that survived the collision check in §7 are shown — several strong-sounding concepts (Wren, Amara, Kindred, Verve, Sway) were cut here precisely because diligence caught real collisions before the finalist stage.

| Name | Memor. | Pronun. | TR usab. | EN usab. | Brandability | Trust | Premium | AS relevance | Search potential | Logo potential | Expansion | **Total /55** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Ilium** | 4 | 4 | 3 | 4 | 5 | 4 | 5 | 5 | 3 | 5 | 4 | **46** |
| Vertra | 4 | 5 | 4 | 5 | 4 | 3 | 3 | 4 | 3 | 3 | 4 | 42 |
| Kaynak | 4 | 3 | 5 | 3 | 4 | 4 | 4 | 3 | 2 | 3 | 4 | 39 |
| Verrin | 3 | 5 | 4 | 5 | 4 | 3 | 4 | 1 | 2 | 3 | 5 | 39 |
| Marrow | 4 | 5 | 3 | 5 | 4 | 3 | 3 | 2 | 2 | 4 | 3 | 38 |
| Elyra | 3 | 4 | 3 | 4 | 3 | 3 | 4 | 1 | 2 | 3 | 4 | 34 |
| Kıvrak | 3 | 2 | 5 | 2 | 4 | 3 | 3 | 3 | 2 | 3 | 3 | 33 |
| Solume | 3 | 4 | 3 | 4 | 3 | 3 | 3 | 1 | 2 | 2 | 3 | 31 |
| Vessa | 3 | 4 | 3 | 4 | 3 | 2 | 3 | 1 | 2 | 2 | 3 | 30 |
| Norema | 2 | 3 | 3 | 3 | 2 | 2 | 2 | 1 | 1 | 2 | 3 | 24 |

Note: Verrin scores well overall but carries the lowest AS-relevance in the table (1/5) — a deliberately blank-slate invented word, a legitimate path in principle (Oura/Calm precedent, §3), but it means 100% of the brand's meaning must be built through marketing/product alone. Weighed against Ilium and Kaynak, which get real relevance for free, this is the deciding factor keeping it out of the final three.

## 7. Availability/collision spot-check

**A public web-search spot-check only — explicitly NOT formal trademark clearance.** A real legal trademark/domain/App Store/social-handle check (Turkey plus relevant English-speaking markets) is required before any commercial commitment.

**Eliminated — live, recognizable collision found**: Axil (Axil Health, a funded patient-care company), Kynos (Kynos Therapeutics, a biopharma company — also reads pharma), Wren (Wren Health, a direct-competitor-adjacent app), Amara (AmaraHealth™, a trademarked live health app), Kaya (Kaya Women's Wellness, near-identical positioning; also Kaya Clinics, a multinational chain), Tandem (Tandem Diabetes Care, a major public medical-device company), Haven (a well-known former Amazon/Berkshire/JPMorgan healthcare venture, plus Haven Life insurance), Kindred (Kindred Healthcare, a major hospital/rehab chain), Sway (Sway Medical, an FDA-cleared app), Halcyon (Halcyon Health App, a live direct-category tracker), Amble (Amble Health telehealth, plus an unrelated Amble fitness tracker), Sella (Sella Care; Banca Sella, a major Italian bank), Verve (at least four live "Verve"-branded health/fitness apps), Loma (two live "Loma" trackers), Talus (phonetically close to Talamus Health, a live app; also Talus Bioscience), Throughline (an established mental-health crisis-support platform), Ilara (Ilara Health, a recognized African health-tech company), Verda (Verda Healthcare, a major Medicare Advantage insurer), Auven (Auven Therapeutics, a pharma investment firm), Tellu (Tellu AS, a Norwegian home-care health-tech company), Denge (collides with Google's own Turkish "Digital Wellbeing" localization), Reha (saturated with literal rehabilitation apps; also too clinical per the brief's own guidance), Kestra (Kestra Medical Technologies, a real medical-device company).

**Survived the spot-check** (no live recognizable direct collision, or only an unrelated low-confusion-risk collision, flagged where applicable): **Ilium** (a legacy, non-health desktop-software brand of the same name exists — negligible consumer-confusion risk in a health-app context), **Vertra**, **Kaynak**, **Verrin**, Marrow (minor unrelated niche apps exist), Kıvrak, Elyra (unrelated-category brands exist), Solume (unrelated-category brand exists), Vessa (unrelated-category brand, plus a phonetically similar footwear brand), Norema (clean, but a legacy unrelated furniture brand exists).

## 8. Final three

### Ilium
- **Pronunciation**: "ILL-ee-um" (English); "İl-yum" (Turkish approximation).
- **Meaning/story**: the *ilium* is the large wing-shaped pelvic bone whose joint with the sacrum — the sacroiliac joint — is the anatomical site where AS/axSpA pathology is classically first detected (sacroiliitis is the hallmark diagnostic imaging finding). The name is medically true without sounding medical; it never spells out "ankylosing" or "spondylitis." Bonus: it echoes *İlyada* (the Iliad), recognized by Turkish speakers from school literature, giving it an unplanned, warm, classical resonance specifically in the Turkish market.
- **Why it fits AS patients**: the one candidate whose meaning is literally, anatomically about this disease's actual first symptom site, while reading — to anyone who doesn't already know that — as a calm, classical, non-alarming word.
- **Brand growth potential**: nothing locks it to symptom tracking alone; carries medication, labs, appointment prep, and Timeline equally, and could extend to related spondyloarthropathies or broader rheumatology without a rename.
- **Organic-acquisition advantage**: distinctive enough to own in App Store search and word-of-mouth ("try Ilium"); pairs cleanly with a keyword-dense subtitle to capture the "AS tracker" cluster (§2) without diluting the brand.
- **Weakness**: its meaning is a discovery, not instant — needs one line of "why we're called Ilium" in onboarding/App Store copy; a small, unrelated legacy desktop-software brand of the same name exists (low real risk, confirm in formal clearance).
- **Logo direction**: an abstracted wing/arc shape referencing the ilium's own silhouette — soft and geometric, never literally skeletal or clinical.
- **App icon direction**: a single simplified curved form on a calm, warm ground — closer to a minimal ring/mark language than a medical-cross icon.
- **Suggested App Store display name**: "Ilium — AS & axSpA Tracker"
- **Suggested App Store subtitle**: "Symptoms, meds, labs & visits"

### Vertra
- **Pronunciation**: "VER-truh" — reads identically in English and Turkish.
- **Meaning/story**: invented, rooted in "vertebra" — pronounceable and spellable everywhere, importing no language-specific baggage.
- **Why it fits AS patients**: immediately, if subtly, spine-adjacent without spelling out the diagnosis.
- **Brand growth potential**: fully invented, no hard limitation — could extend to any spine/joint-adjacent condition.
- **Organic-acquisition advantage**: very easy to say, spell, and search from a standing start in any market.
- **Weakness**: the "-tra" ending pattern reads closer to a pharmaceutical/biotech naming convention than a consumer health brand — of the three finalists, the one most likely to be mistaken for a drug or clinical-SaaS product on first glance, working against a "trust, not cold clinical" goal.
- **Logo direction**: a single continuous curved line motif (abstractly echoing a spinal curve, never literal vertebrae).
- **App icon direction**: a minimal wordmark-driven icon (a lowercase "v" treated as a soft curve) rather than a pictorial icon.
- **Suggested App Store display name**: "Vertra: Ankylosing Spondylitis"
- **Suggested App Store subtitle**: "AxSpA symptom & med tracker"

### Kaynak
- **Pronunciation**: "KY-nak."
- **Meaning/story**: Turkish for "source"/"wellspring" — a positive, everyday word and a soft phonetic cousin of *kaynaşma*, the Turkish lay term for spinal fusion in AS, without spelling the clinical term out.
- **Why it fits AS patients**: for the Turkish-speaking core market, the deepest and most authentic linguistic/emotional fit of any candidate researched.
- **Brand growth potential**: "source" as a metaphor extends naturally (source of truth, of calm, of data for your doctor) well beyond one feature or even one condition.
- **Organic-acquisition advantage**: a strong "sounds like us" quality specifically inside the Turkish AS community (the Ekşi Sözlük thread, the Facebook group identified in §2).
- **Weakness**: carries zero built-in meaning for English speakers — the international market gets none of the "free" relevance the Turkish market gets, same brand-building cost as a fully invented word, without an invented word's total pronunciation ease.
- **Logo direction**: a simple spring/wellspring-derived mark — concentric or radiating soft lines, abstract enough to also read as "signal" or "origin point."
- **App icon direction**: a radiating dot/burst motif in a warm, single accent color.
- **Suggested App Store display name**: "Kaynak: Ankilozan Spondilit Takibi" (TR) / "Kaynak: AS & axSpA Tracker" (EN)
- **Suggested App Store subtitle**: "Semptom, ilaç ve randevu günlüğü" (TR) / "Symptoms, meds & appointments" (EN)

## 9. Recommended winner: Ilium

**Update (Phase DESIGN-A2 stress test):** this recommendation was subsequently subjected to a dedicated adversarial stress test — see `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §1-3, §12. That pass found real, previously-undetected weaknesses this document's own spot-check missed (an active, unrelated-category software-company collision — "Ilium Software," founded 1997 — plus a documented ilium/ileum medical-terminology confusion, plus a larger Troy/Vonnegut literary association than credited here) and, in the course of seriously trying to replace Ilium, found that **every real-word alternative checked collides too, several worse** (Marrow against a direct Pfizer health-app competitor; Solace against multiple live health/wellness apps; Vertra, this document's own runner-up, against an established consumer suncare brand its own round-1 spot-check missed). The final decision is **Ilium confirmed**, with three binding mitigations now required (an explicit onboarding/About-screen sentence explaining the ilium-bone meaning; App Store copy that never relies on the bare word "Ilium" alone; and real trademark/domain clearance treated as higher-stakes than originally assumed). This is a *qualified* confirmation, not the unexamined one below — read `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` alongside this section, not instead of it.

**Ilium wins, decisively.**

**Against Vertra**: Vertra is the "safer" invented word — cleaner in a legal-search sense, slightly easier to pronounce — but buys that safety by giving up meaning entirely, and worse, its "-tra" pattern nudges it toward reading as pharmaceutical/clinical-SaaS, exactly the register this reset is meant to move away from. Ilium gets everything Vertra offers (pronounceable, spellable, ownable, non-literal) *plus* a real, medically true story — for free. When two names are otherwise close, the one with an authentic story wins, because that story becomes onboarding copy, App Store description, press language, and founder narrative at zero extra cost.

**Against Kaynak**: Kaynak is the emotionally richer choice *for the Turkish market alone*, and if this were a Turkey-only product forever it might be the right call. But English-speaking international markets are a stated primary target, not an afterthought, and on a hard-paywall subscription product every market needs the name pulling its own weight. Kaynak asks the English market to build 100% of the brand's meaning from a word with zero built-in resonance there — the same cost as an invented word, without an invented word's frictionless pronunciation. Ilium works in both directions at once: real anatomical meaning for anyone who looks it up, calm and classical on first hearing for anyone who doesn't, plus the unplanned Iliad echo specifically for Turkish users. It's the only finalist that doesn't force a trade-off between the two markets.

**Against keeping "Ankilozanapp"**: not close. §1 already established the current name fails memorability, pronunciation, word-of-mouth, defensibility, and expansion — and every real competitor found (Rapha, AS Log, Bearable, Visible, Hurtl) has already made the exact move recommended here: a real brand name, a descriptive subtitle. Staying with "Ankilozanapp" preserves nothing — its one asset, direct searchability, transfers fully and immediately into the subtitle/keywords under "Ilium — AS & axSpA Tracker" (§10), so there is zero organic-search cost to switching, only upside. Short-term, Ilium loses nothing on discoverability a well-built subtitle can't recover. Long-term, it gains a name that can actually be trademarked, said aloud, remembered, and grown — which "Ankilozanapp" structurally cannot ever become.

**Evaluated against both horizons explicitly**: short-term organic discovery is fully preserved via §10's ASO architecture (the condition-name keywords move into subtitle/keywords, costing nothing). Long-term brand equity is where Ilium wins outright — it is the only candidate researched that is simultaneously ownable, defensible, meaningful, and works identically well in both of this product's core markets.

## 10. ASO positioning for Ilium

- **App Store display name**: `Ilium — AS & axSpA Tracker`
- **Subtitle**: `Symptoms, meds, labs & visits`
- **Positioning statement**: Ilium is the daily companion for people living with ankylosing spondylitis and axial spondyloarthritis — a calm, private place to log how you're feeling, track your biologic and medication schedule, keep your CRP/ESR labs in one timeline, and walk into every rheumatology appointment with a clear, shareable summary instead of a foggy memory of the last three months.
- **Primary search-intent keyword clusters**: ankylosing spondylitis tracker, axSpA tracker, AS symptom diary, spondyloarthritis app, BASDAI tracker, biologic medication tracker, injection reminder.
- **Secondary search-intent keyword clusters**: chronic pain tracker, rheumatology appointment prep, CRP ESR log, morning stiffness tracker, chronic illness journal, autoimmune symptom log.
- **Keyword-field themes** (Apple's 100-character field): `axspa,ankylosing,spondylitis,basdai,crp,esr,rheumatology,biologic,injection,stiffness,flare,pain diary`
- **Screenshot-message hierarchy** (first 5-6 screens): (1) hook/identity — establish who this is for, that it understands the disease, before any UI; (2) the core daily check-in — fast, low-effort, human; (3) medication/injection tracking — the biologic schedule and reminder, the highest-retention feature; (4) labs — CRP/ESR trend translated into a story; (5) Appointment Summary — the differentiator, what walks out of the app into the rheumatologist's hands; (6) Timeline — the payoff screen, the whole health story in one place over time.
- **First three screenshot messages (draft copy — no medical claims, no diagnostic language, never a product-declared "flare")**:
  1. "Track how you actually feel — in seconds, every day."
  2. "Never miss a dose. Injection and medication reminders, built around your schedule."
  3. "Walk into your rheumatology appointment with the full picture — not just what you remember."

## 11. Organic growth loops

**Recommended, with reasoning specific to this product and audience:**

1. **The shareable Appointment Summary as a discovery surface.** When a patient hands or sends a clean, well-formatted visit summary to a rheumatologist, and the rheumatologist visibly finds it useful, that clinician becomes a plausible, credible word-of-mouth channel to other patients — entirely outside any spammy mechanic. §2's own research confirms appointment prep is a real, underserved need (especially in Turkish, where no dedicated content exists) — this productizes something patients already wish they had, rather than manufacturing a reason to share.
2. **Patient-community-driven recommendation inside existing AS/axSpA spaces** — the Ekşi Sözlük thread, the Turkish Facebook group, English-language patient sites (§2). The right move is not to market into these spaces uninvited, but to be the kind of product patients naturally mention there when someone asks "how do you track your AS" — which depends entirely on being genuinely better at the AS-specific job than generic chronic-illness trackers. Condition-specific utility, not generic tracking, is the actual lever.
3. **Educational AS content as a discovery surface, specifically in Turkish** — §2 found a genuine content gap: almost nothing exists in Turkish about preparing for a rheumatology appointment specifically. A small set of genuinely useful, non-salesy Turkish articles on this exact topic would rank organically (low competition) and funnel directly into the product's core differentiator, without competing in the crowded "what is AS" informational space already dominated by hospital SEO content.
4. **A nameable, recognizable Timeline concept.** If Timeline is distinctive and well-designed enough to have its own identity within the product, patients describing their experience to each other ("I finally have a timeline of everything") creates a natural, low-effort word-of-mouth hook — this works specifically because chronic-illness patients already describe their disease experience in exactly this narrative, chronological way (evidenced directly in the Ekşi Sözlük personal accounts).

**Explicitly ruled out, and why**: spammy referral mechanics (chronic-illness communities are unusually sensitive to anything transactional about health data or peer relationships — it would cost more trust than it buys installs); forced/nagging sharing prompts (actively hostile to a product whose core promise is a private, safe place to be honest about pain and fatigue); fake social proof (never fabricate testimonials or install-count pressure — consistent with the "no invented metrics" discipline governing this whole product, and especially corrosive in a trust-dependent chronic-illness category); unrelated gamification (streaks/badges/leaderboards for symptom logging — turning a bad-pain day into a "broken streak" is actively harmful for this audience, ruled out entirely); anything that publicly discloses a user's private health data (the Appointment Summary and Timeline must always be user-initiated, user-controlled shares to a chosen recipient, never anything defaulting toward public or semi-public visibility).

## 12. Brand-to-visual-identity bridge

- **Logo concept**: an abstracted wing-like curve referencing the ilium bone's real silhouette, simplified to a single continuous line — never literal/skeletal, never a medical cross or spine illustration. This connects directly to `docs/DESIGN_DIRECTION_2_0.md`'s chosen logo concept ("The Held Line" — see that document §3) by giving that stroke a specific, name-true shape: the line is literally the ilium's own gentle wing-curve, and it also carries the "irregular becoming steady" narrative quality along its length — the mark is simultaneously anatomically true to the name and emotionally true to the Editorial Health Journal territory.
- **App icon concept**: that same curve reduced to its simplest form on a warm, muted single-color ground — legible as a small, quiet mark at icon size, closer to a wellness-brand icon than a medical-app icon; replaces the current unfinished, off-brand blue gradient chevron entirely.
- **Typography personality**: a humanist sans-serif with slightly rounded terminals — confident and legible (functionally important for a data-entry-heavy app used by people with joint pain, not just aesthetically), never sharp/clinical or condensed/dense — compatible with keeping the system font (SF Pro) per `docs/DESIGN_DIRECTION_2_0.md` §6.
- **Color-palette personality**: warm, low-saturation neutrals as the base with a single confident accent reserved for key actions and the Ilium curve motif — deliberately not clinical blue-on-white, not a loud gradient-heavy wellness palette; closer to a well-designed personal notebook than a hospital app. Compatible with, and specifically pairs with, `docs/DESIGN_DIRECTION_2_0.md`'s recommended "Paper & Ink" palette direction.
- **Motion personality**: slow, settling motion — elements ease to rest rather than bounce or snap; given the audience frequently experiences stiffness and fatigue, hurried/snappy motion works against the brand's emotional promise.
- **Illustration language**: if used at all, abstract curved forms echoing the logo motif only — never literal depictions of pain, spines, or medical imagery, which reads clinical and can feel alarming to a chronic-pain audience seeing their own condition rendered back at them.
- **Today**: should feel like opening a calm notebook, not a dashboard — the Ilium curve motif can anchor the screen quietly (e.g., a subtle background/progress element) so the brand is present without competing with the day's actual check-in content.
- **Check-in**: should feel unhurried and forgiving — generous touch targets, slow-settling motion on selection, language that never rushes or gamifies a hard day. This is where the "calm, not clinical" promise is tested most directly, every day.
- **Timeline**: the payoff of the "record/journey" meaning — a long, gently scrolling curve echoing the logo through time, where the accumulated record itself becomes visually satisfying to look at, reinforcing that consistent use has real value.
- **Appointment Summary**: the most composed, document-like surface in the app — a deliberate shift toward clarity and restraint (more whitespace, less warmth-forward styling), because its job is to build a stranger's (the rheumatologist's) trust in seconds, a different design job than building the patient's own daily trust on Today.

## Sources

Live App Store/product listings for AS Log, Rapha, Hurtl, Flare (flarelog.app); web research on Unstiff, ASAS App, Chronic Insights, Axia App, Bearable, Visible, Flaredown, Flura, ArthritisPower/PatientSpot, CreakyJoints, Manage My Pain, Symple; Turkish-language research on the Ekşi Sözlük "ankilozan spondilit" thread, Turkish Facebook/Instagram AS-patient communities, and the search terms "sabah tutukluğu," "aksiyel spondiloartrit," "romatoloji randevu," "eklem ağrısı takibi," "kaynak," "denge," "reha," "diri," "kıvrak"; and roughly 30 individual English/Turkish collision spot-checks against candidate names, run against live search results. All collision findings are spot-checks, not legal clearance — see §7.
