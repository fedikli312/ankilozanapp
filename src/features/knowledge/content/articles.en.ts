import type { KnowledgeArticle } from "../types";

/**
 * English Knowledge Hub content — Product 2.0 Phase P. See `types.ts` for
 * why this lives here rather than in `en.json`. `id` is the shared join key
 * with `articles.tr.ts`; a Jest test enforces the two files carry the exact
 * same id set (§16, §32).
 *
 * Researched against current (Sept 2026) authoritative sources — NHS,
 * Versus Arthritis, NICE, and the Spondylitis Association of America — not
 * written from memory alone (Phase P brief §1, §33). Every claim below
 * traces to a `sources` entry. Reviewed against the brief's safety
 * checklist (§10-13, §25, §33) before inclusion: no diagnosis, no treatment
 * ranking, no dose guidance, no causal claims from a single reading, no
 * certainty beyond what the source itself states.
 */
export const KNOWLEDGE_ARTICLES_EN: KnowledgeArticle[] = [
  {
    id: "what-is-as",
    category: "basics",
    icon: "book-outline",
    title: "What is ankylosing spondylitis?",
    summary: "A short, plain-language introduction to the condition.",
    readTime: "2 min",
    keyPoints: [
      "A long-term inflammatory condition mainly affecting the spine and sacroiliac joints",
      "Symptoms often develop gradually, over months or years",
      "There is no cure, but treatment and movement can help manage it",
    ],
    sections: [
      {
        heading: "A chronic inflammatory condition",
        body: "Ankylosing spondylitis (AS) causes inflammation, mainly where the spine meets the pelvis and along the spine itself. Over time, some people notice reduced flexibility in their back.",
      },
      {
        heading: "How it usually shows up",
        body: "Back pain and stiffness, especially first thing in the morning or after resting, are the most common early signs. Fatigue and joint discomfort elsewhere in the body can also occur.",
      },
      {
        heading: "It varies a lot between people",
        body: "How AS affects someone's day-to-day life differs widely — some people manage very well long-term, while others need more support. There's no single fixed path.",
      },
      {
        heading: "Managed, not cured",
        body: "There's currently no cure for AS, but a combination of movement, treatment, and monitoring can help most people manage symptoms and stay active.",
      },
    ],
    sources: [
      { organization: "NHS", title: "Ankylosing spondylitis", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "axspa-and-as",
    category: "basics",
    icon: "layers-outline",
    title: "Axial spondyloarthritis and AS — how they relate",
    summary: "Two related terms you may see used differently by different sources.",
    readTime: "2 min",
    keyPoints: [
      "Axial spondyloarthritis (axSpA) is the broader umbrella term",
      "Ankylosing spondylitis is the form where changes are visible on an X-ray",
      "Non-radiographic axSpA describes the same disease process before those changes appear",
    ],
    sections: [
      {
        heading: "One umbrella, two names",
        body: "Axial spondyloarthritis (axSpA) describes inflammatory disease mainly affecting the spine and pelvis. Ankylosing spondylitis is one specific form of it — the two terms are closely related but not always used identically.",
      },
      {
        heading: "What separates them",
        body: "AS is diagnosed when structural changes are visible on an X-ray of the sacroiliac joints. When someone has the same inflammatory pattern but no visible X-ray changes yet, it's usually called non-radiographic axSpA.",
      },
      {
        heading: "Not two different diseases",
        body: "Non-radiographic axSpA and AS are considered part of the same underlying condition, at different points of visible change. Non-radiographic axSpA can, but doesn't always, progress to show X-ray changes over time.",
      },
      {
        heading: "Why the wording can vary",
        body: "You may see either term used in different places — clinical letters, research, or this app. If a term used elsewhere feels unclear, it's a reasonable thing to ask your rheumatology team about directly.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Ankylosing Spondylitis", url: "https://spondylitis.org/about-spondylitis/overview-of-spondyloarthritis/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "morning-stiffness",
    category: "symptoms",
    icon: "time-outline",
    title: "Why morning stiffness is worth tracking",
    summary: "What makes AS-related stiffness distinct, and why noting its length is useful.",
    readTime: "2 min",
    keyPoints: [
      "Stiffness lasting 30 minutes or more, easing with movement, is a recognized pattern in AS",
      "It commonly appears after rest — overnight, or after sitting still",
      "Tracking its length over time can help you and your care team spot patterns",
    ],
    sections: [
      {
        heading: "A recognizable pattern",
        body: "Morning back stiffness that lasts half an hour or longer, and gradually eases with movement, is a pattern commonly described in inflammatory back pain like AS — unlike typical muscular stiffness, which tends to ease quickly.",
      },
      {
        heading: "Rest can make it worse, not better",
        body: "Stiffness after long periods of inactivity (overnight sleep, a long car ride, sitting at a desk) is a recognized feature — movement, not rest, is what tends to help it settle.",
      },
      {
        heading: "Why your own record matters",
        body: "Everyone's baseline is different. Recording how long your stiffness lasts, day to day, builds a picture that's specific to you — useful to look back on, rather than to interpret in the moment.",
      },
    ],
    tip: {
      heading: "Worth knowing",
      body: "A single stiff morning doesn't tell you much on its own — the pattern over days and weeks is what tends to be more informative.",
    },
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "NHS inform", title: "Ankylosing spondylitis (AS)", url: "https://www.nhsinform.scot/illnesses-and-conditions/muscle-bone-and-joints/neck-and-back-problems-and-conditions/ankylosing-spondylitis", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "pain-and-fatigue",
    category: "symptoms",
    icon: "body-outline",
    title: "Pain and fatigue — what to know",
    summary: "Two of the most common day-to-day experiences of living with AS.",
    readTime: "3 min",
    keyPoints: [
      "Pain and fatigue are both common in AS, and can vary independently",
      "Fatigue in AS is often linked to inflammation, sleep quality, and pain together — not just tiredness",
      "Recording both regularly, honestly, is more useful than judging a single day",
    ],
    sections: [
      {
        heading: "Pain can come and go",
        body: "AS-related pain often varies day to day and doesn't always follow a predictable pattern. Some days are simply harder than others, without a clear single reason.",
      },
      {
        heading: "Fatigue is more than being tired",
        body: "Fatigue in inflammatory conditions like AS is often described as a heavier, harder-to-shift tiredness than everyday tiredness, and can be affected by inflammation, disrupted sleep, and pain together.",
      },
      {
        heading: "They don't always move together",
        body: "A low-pain day doesn't automatically mean low fatigue, and the reverse is also true. Tracking them as separate values, the way this app does, reflects that they're related but distinct experiences.",
      },
      {
        heading: "What your record is for",
        body: "A day-to-day record is most useful as a factual reference over time — for you, and to bring to your care team — rather than something to interpret alone in the moment.",
      },
    ],
    sources: [
      { organization: "NHS", title: "Ankylosing spondylitis", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "nsaid-role",
    category: "treatment",
    icon: "medical-outline",
    title: "The general role of anti-inflammatory medication",
    summary: "A high-level look at NSAIDs as a category — not a recommendation.",
    readTime: "2 min",
    keyPoints: [
      "NSAIDs are a commonly discussed medication category for AS-related pain",
      "Current guidance favors the lowest effective dose, reviewed regularly",
      "Treatment plans are individual and set by your care team",
    ],
    sections: [
      {
        heading: "A commonly used category",
        body: "Non-steroidal anti-inflammatory drugs (NSAIDs) are a medication category commonly discussed for AS-related pain and stiffness, typically at the lowest dose that helps, under a clinician's guidance.",
      },
      {
        heading: "Reviewed, not fixed",
        body: "Current clinical guidance describes ongoing monitoring — checking how well a medication is working, and watching for side effects — as part of using this category of medication safely over time.",
      },
      {
        heading: "Individual by design",
        body: "What works, and at what dose, differs from person to person. This is a decision made together with your rheumatology team, based on your own response and health history.",
      },
    ],
    sources: [
      { organization: "NICE", title: "Spondyloarthritis in over 16s: diagnosis and management (NG65)", url: "https://www.nice.org.uk/guidance/ng65/chapter/recommendations", accessedAt: "2026-09-01" },
      { organization: "NHS", title: "Ankylosing spondylitis — Treatment", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "biologic-therapies",
    category: "treatment",
    icon: "flask-outline",
    title: "What are biologic therapies?",
    summary: "A general, category-level explanation — not drug-specific advice.",
    readTime: "2 min",
    keyPoints: [
      "Biologic medications target specific parts of the immune/inflammation process",
      "Whether this category is considered depends on individual treatment history and response",
      "Which biologic, if any, is right is an individual clinical decision",
    ],
    sections: [
      {
        heading: "What makes them different",
        body: "Unlike general anti-inflammatory medication, biologic therapies are designed to target specific proteins involved in the inflammation process — for example, some target a protein called TNF.",
      },
      {
        heading: "How this fits into a treatment plan",
        body: "Whether and when biologic therapies are considered varies from person to person, based on individual treatment history and response — this is assessed by a rheumatology team, not a fixed rule that applies the same way to everyone.",
      },
      {
        heading: "A shared decision",
        body: "There are several types and options within this category. Which one, if any, may suit someone is assessed individually by their rheumatology team — this app doesn't make that assessment.",
      },
    ],
    sources: [
      { organization: "NICE", title: "Spondyloarthritis in over 16s: diagnosis and management (NG65)", url: "https://www.nice.org.uk/guidance/ng65/chapter/recommendations", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Ankylosing Spondylitis — Treatment", url: "https://spondylitis.org/about-spondylitis/treatment-information/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "movement-daily-life",
    category: "dailyLife",
    icon: "walk-outline",
    title: "Movement and daily life with AS",
    summary: "Why staying active is often described as a core part of managing AS.",
    readTime: "2 min",
    keyPoints: [
      "Regular movement is widely described as central to managing AS",
      "Long periods of inactivity are commonly linked with more stiffness",
      "Starting gently and building up gradually is a common, sensible approach",
    ],
    sections: [
      {
        heading: "Why movement matters here specifically",
        body: "Patient organizations consistently describe exercise as playing an especially important role in AS, more so than in many other conditions — helping maintain spinal flexibility and range of movement.",
      },
      {
        heading: "Rest isn't always restful for AS",
        body: "Too much inactivity is commonly associated with increased stiffness in AS, which is part of why gentle, regular movement is so often emphasized alongside any treatment plan.",
      },
      {
        heading: "Starting point, not a prescription",
        body: "General guidance favors starting slowly and building up gradually. What's right for your body is worth discussing with your care team or a physiotherapist rather than guessing.",
      },
    ],
    tip: {
      heading: "Worth knowing",
      body: "This app's Nefes & Postür routines are short, general supportive exercises — not a personalized physiotherapy plan.",
    },
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Spondyloarthritis and Exercise", url: "https://spondylitis.org/about-spondylitis/treatment-information/exercise/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "desk-posture",
    category: "dailyLife",
    icon: "desktop-outline",
    title: "Sitting and desk posture",
    summary: "General, practical ideas for long periods at a desk.",
    readTime: "2 min",
    keyPoints: [
      "Staying in one position for long stretches is generally discouraged",
      "Chair height, back support, and screen position all play a role",
      "Small, regular position changes are more helpful than one perfect posture",
    ],
    sections: [
      {
        heading: "Movement beats a single 'correct' posture",
        body: "Rather than staying still in one ideal position, changing position regularly throughout the day — standing, stretching, adjusting your chair — is generally the more helpful habit.",
      },
      {
        heading: "Setting up your space",
        body: "A supportive, upright chair, your back reaching the chair's backrest, and your screen and keyboard within easy reach without stretching, are commonly suggested basics for a desk setup.",
      },
      {
        heading: "Small, regular breaks",
        body: "Brief, frequent breaks to stand and move tend to be more sustainable than trying to hold a single perfect position for hours at a time.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "sleep-routine",
    category: "dailyLife",
    icon: "bed-outline",
    title: "Sleep and your daily routine",
    summary: "General ideas that some people with AS find helpful.",
    readTime: "2 min",
    keyPoints: [
      "Disrupted sleep is commonly reported alongside AS",
      "Sleep position and mattress firmness are commonly mentioned factors",
      "A consistent routine is a reasonable place to start",
    ],
    sections: [
      {
        heading: "Sleep and AS often interact",
        body: "Disrupted or poor-quality sleep is commonly reported by people living with AS, and pain or stiffness can make settling into a comfortable position harder.",
      },
      {
        heading: "Position and support",
        body: "Some people find that sleeping in a straighter, more neutral spinal position, with supportive but not overly firm bedding, feels more comfortable — this varies from person to person.",
      },
      {
        heading: "Routine helps generally",
        body: "A consistent wind-down routine and regular sleep/wake times are broadly useful sleep habits, and there's no reason they'd be less relevant for someone managing AS.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "appointment-prep",
    category: "appointmentPrep",
    icon: "calendar-outline",
    title: "Getting ready for a rheumatology appointment",
    summary: "Practical ways to make the most of a limited amount of time.",
    readTime: "2 min",
    keyPoints: [
      "A short summary of recent symptoms is more useful than trying to recall everything live",
      "Bringing a current medication list saves time",
      "It's reasonable to bring someone with you, or write questions down in advance",
    ],
    sections: [
      {
        heading: "Bring a summary, not just memory",
        body: "Appointments are often short, and recalling weeks of detail from memory is hard for anyone. A brief written or app-based summary of recent symptoms tends to be genuinely useful to bring.",
      },
      {
        heading: "Medications and recent results",
        body: "A current list of medications and doses, plus any recent lab or imaging results you have, helps your care team pick up the conversation quickly.",
      },
      {
        heading: "You're allowed to prepare questions",
        body: "Writing down what you want to ask beforehand — and bringing someone with you if that helps — is a normal, sensible way to make sure nothing important gets missed in a short visit.",
      },
    ],
    tip: {
      heading: "Worth knowing",
      body: "This app's own Appointment Preparation summary is built for exactly this — a factual recap of your recent check-ins, treatments, and labs to bring with you.",
    },
    sources: [
      { organization: "American College of Rheumatology", title: "How To Prepare for Your Rheumatology Appointment", url: "https://rheumatology.org/patient-blog/how-to-prepare-for-your-rheumatology-appointment", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "doctor-questions",
    category: "appointmentPrep",
    icon: "chatbubble-ellipses-outline",
    title: "Questions you could ask your doctor",
    summary: "Starting points — not a script, and not a substitute for your own questions.",
    readTime: "2 min",
    keyPoints: [
      "There's no wrong question to bring to an appointment",
      "Asking about the purpose of a test or a next step is always reasonable",
      "Asking for anything unclear to be explained again is normal, not a bother",
    ],
    sections: [
      {
        heading: "About your own pattern",
        body: "It's reasonable to ask how your recent symptoms compare with what you've described before, and whether anything you've noticed is worth flagging specifically.",
      },
      {
        heading: "About tests and next steps",
        body: "Asking what a specific test is checking for, and what happens after the results come back, helps you understand the plan rather than just following it.",
      },
      {
        heading: "About anything unclear",
        body: "If a term or explanation doesn't make sense, asking for it again in plainer language is a completely normal, expected part of a good appointment.",
      },
    ],
    sources: [
      { organization: "Arthritis Foundation", title: "Questions to Ask Your Doctor", url: "https://www.arthritis.org/health-wellness/treatment/treatment-plan/you-your-doctor/questions-about-ra", accessedAt: "2026-09-01" },
      { organization: "American College of Rheumatology", title: "How To Prepare for Your Rheumatology Appointment", url: "https://rheumatology.org/patient-blog/how-to-prepare-for-your-rheumatology-appointment", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "crp-esr",
    category: "symptoms",
    icon: "flask-outline",
    title: "What CRP and ESR results mean",
    summary: "General background on two common inflammation markers.",
    readTime: "2 min",
    keyPoints: [
      "CRP and ESR are general markers of inflammation, not specific to AS",
      "A single value doesn't define your disease state on its own",
      "They're best understood alongside your symptoms and history, by your care team",
    ],
    sections: [
      {
        heading: "What they measure",
        body: "C-reactive protein (CRP) and erythrocyte sedimentation rate (ESR) are both general blood markers that can rise when inflammation is present somewhere in the body.",
      },
      {
        heading: "Not specific to one condition",
        body: "A raised CRP or ESR indicates inflammation is present, but not what's causing it — many things besides AS can raise these values, and they're never read in isolation clinically.",
      },
      {
        heading: "One number, many possible explanations",
        body: "A single result, on its own, doesn't define how your AS is doing on any given day. Your care team interprets it alongside your symptoms, exam, and history.",
      },
      {
        heading: "Why this app just shows the number",
        body: "This app records your CRP/ESR values and shows them against your own history, with no automated interpretation — that reading is for you and your clinician, not this app.",
      },
    ],
    sources: [
      { organization: "Arthritis Foundation", title: "Blood Tests for Arthritis", url: "https://www.arthritis.org/health-wellness/about-arthritis/understanding-arthritis/blood-tests-for-arthritis", accessedAt: "2026-09-01" },
      { organization: "Leeds Teaching Hospitals NHS Trust", title: "C-Reactive Protein (CRP)", url: "https://www.leedsth.nhs.uk/services/pathology/tests/c-reactive-protein-crp/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
];
