---
name: maintain-fooh-profile
description: Keep the user's FOOH.com profile maintained — check profile health, publish new work since the last update, refresh availability, skills and showreel. Use when the user asks to update, refresh, maintain or tidy their FOOH profile, or asks why they rank low on FOOH.
---

# Maintain a FOOH profile

FOOH's talent directory ranks maintained profiles higher. "Maintained" is a fixed checklist, and `get_profile_health` reports it:

- new work in the last 90 days that the FOOH team has reviewed,
- a showreel,
- at least one capability, tool and industry,
- availability confirmed in the last 60 days (re-saving it counts, even unchanged).

Nothing else counts — edit volume, re-uploads and cosmetic changes don't help, so don't churn the profile.

## Steps

1. `get_profile_health` and `get_my_profile`. Tell the user what's done and what isn't.
2. **Availability:** ask whether they're taking work right now, then `update_profile {available: true|false}`. Always ask — never guess or re-save a stale answer.
3. **Skills:** if capabilities, tools or industries are empty or thin, suggest entries from their existing works (`list_my_works`, `get_my_work`) and `list_vocabulary`; confirm, then `update_profile` with the FULL lists (they replace).
4. **Showreel:** if missing, ask for a Vimeo/YouTube link (`update_profile {showreelUrl}`).
5. **New work:** compare `list_my_works` with the user's recent finals (ask where they keep them). For new pieces, follow the `publish-to-fooh` skill. Reviewed new work is the strongest item on the checklist, and the review happens on FOOH's side after publishing.
6. Tidy only when asked: fix typos in titles/credits (`update_work`), reorder the portfolio (`reorder_works`) so the strongest work leads. Never delete a work without explicit confirmation.

End with `get_profile_health` again and the profile URL.
