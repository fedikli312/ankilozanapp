# Third-Party Asset Sources

Records every third-party (non-authored-by-this-project) visual asset bundled into the app, its exact source, and its license — so provenance is always auditable, even though none of the licenses used so far require in-app attribution.

---

## Body Map silhouette (check-in Body Map, SVG-backed rewrite)

- **Asset**: "Human silhouette gender neutral back.svg"
- **Source**: Wikimedia Commons
- **Source page**: https://commons.wikimedia.org/wiki/File:Human_silhouette_gender_neutral_back.svg
- **Direct file (as downloaded)**: https://upload.wikimedia.org/wikipedia/commons/8/85/Human_silhouette_gender_neutral_back.svg
- **Author**: Sebastian Wallroth (Wikimedia Commons username `Sebastian Wallroth`)
- **License**: CC0 1.0 Universal (Public Domain Dedication) — confirmed directly on the source page. No attribution is legally required; recorded here purely for provenance.
- **Verified**: 2026-09-01, directly against the Commons file page and the original SVG file content (both fetched and inspected before use).
- **Where it lives in the repo**:
  - `src/features/checkIn/assets/human-silhouette-gender-neutral-back.svg` — the unmodified reference copy, exactly as downloaded (used only as the provenance record, not loaded at runtime — Metro bundles a JS path constant instead, see below).
  - `src/features/checkIn/BodyRegionMap.tsx` — the actual rendered path, transcribed from the same source's main body-outline path only (the two small decorative crease/fold detail paths in the original were dropped; fill/stroke are set at render time rather than hardcoded in the source file, per the in-file comment at the top of that component). Rendered via `react-native-svg` (`^15.15.5`, dependency-safety-checked before install — see PROJECT_MEMORY.md).
  - Region-highlight overlays (neck/shoulders/upper_back/lower_back/hips) are original shapes authored directly in this project (ellipses/paths hand-fitted to this silhouette's contour) — not derived from any third-party source, no separate license note needed.
- **Why this asset**: gender-neutral, CC0/public-domain, back-view, no anatomical/muscle detail, no cartoon styling — matches the "premium health app illustration" requirement without any licensing risk for a commercial app. Same asset originally sourced and verified earlier in the same work session; re-verified against the same page/content before this restore.
