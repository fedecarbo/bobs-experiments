# Review Page Navigation Audit - Trello Tickets

## Current Navigation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REVIEW PAGE                                         │
│                         (Reviewer's starting point)                              │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
        │ Click "Edit" on section
        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EDIT DESTINATIONS                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  VALIDATION STAGE                    ASSESSMENT STAGE                            │
│  ┌────────────────────┐              ┌────────────────────────────────────────┐  │
│  │                    │              │                                        │  │
│  │  • Description of  │              │  • Pre-application outcome             │  │
│  │    proposal        │              │    + Summary of advice (bundled)       │  │
│  │                    │              │                                        │  │
│  │  • Site            │              │  • Site visit                          │  │
│  │    constraints     │              │  • Meetings                            │  │
│  │                    │              │  • Site map                            │  │
│  └────────────────────┘              │  • Site history                        │  │
│                                      │  • Site and surroundings               │  │
│                                      │  • Planning considerations + Policies  │  │
│                                      │  • Requirements                        │  │
│                                      │                                        │  │
│                                      └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
        │ Click "Back" or "Save"
        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RETURN DESTINATIONS (Current - Broken)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ✓ RETURNS TO REVIEW (Correct)       ✗ RETURNS TO WRONG PLACE (Bugs)            │
│  ┌────────────────────────────┐      ┌────────────────────────────────────────┐  │
│  │                            │      │                                        │  │
│  │  • Pre-application outcome │      │  • Site visit                          │  │
│  │  • Description of proposal │      │    Save → Assessment dashboard         │  │
│  │  • Summary of advice       │      │                                        │  │
│  │  • Site map                │      │  • Site constraints                    │  │
│  │  • Site and surroundings   │      │    Back → Validation                   │  │
│  │  • Meetings                │      │                                        │  │
│  │                            │      │  • Site history                        │  │
│  │                            │      │    Back → Assessment                   │  │
│  │                            │      │                                        │  │
│  │                            │      │  • Planning considerations             │  │
│  │                            │      │    Back + Save → Assessment            │  │
│  │                            │      │                                        │  │
│  │                            │      │  • Requirements                        │  │
│  │                            │      │    Back + Save → Assessment            │  │
│  │                            │      │                                        │  │
│  └────────────────────────────┘      └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Section-by-Section Navigation Flows

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 1: Pre-application outcome                                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment: Outcome + Summary    ──Save/Back──▶ Review ✓       │
│                   (bundled with Section 10)                                      │
│                                                                                  │
│  ⚠️  Issue: Bundled with Summary of advice                                       │
│  ⚠️  Issue: "Save and come back later" wording                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 2: Officer contact details                                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──(no edit)──                                                            │
│                                                                                  │
│  ✓ No issues                                                                     │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 3: Your pre-application details                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit Site visit──▶ Assessment    ──Back──▶ Review ✓                    │
│          │                   └──Add──▶ Form ──Save──▶ Assessment ✗               │
│          │                                                                       │
│          ├──Edit Meetings──▶ Assessment    ──Add meeting──▶ Review ✓             │
│          │                                                                       │
│          └──Edit Description──▶ (See Section 4)                                  │
│                                                                                  │
│  ⚠️  Issue: 3 separate edit points (violates "edit by section")                  │
│  ⚠️  Issue: Site visit Save goes to Assessment dashboard                         │
│  ⚠️  Issue: Inconsistent button styling (Add primary vs secondary)               │
│  ⚠️  Issue: Inconsistent labels ("Add site visit response" vs "Add a new meeting")│
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 4: Description of your proposal                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Validation    ──Save/Back──▶ Review ✓                          │
│                                                                                  │
│  ✓ No issues                                                                     │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 5: Site map                                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment: Check application details    ──Save/Back──▶ Review ✓│
│                   (page has other elements too)                                  │
│                                                                                  │
│  ⚠️  Issue: Edit page contains more than just site map                           │
│  ⚠️  Issue: "Save and come back later" wording                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 6: Relevant site constraints                                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Validation/Assessment    ──Save──▶ Review ✓                    │
│                                            ──Back──▶ Validation ✗                │
│                                                                                  │
│  ⚠️  Issue: Back button goes to Validation instead of Review                     │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 7: Relevant site history                                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment    ──Back──▶ Assessment ✗                           │
│                   └──Add──▶ Form ──Save──▶ ERROR PAGE ✗ (but data saves)         │
│                                                                                  │
│  ⚠️  BUG: Error page when adding site history                                    │
│  ⚠️  Issue: Back goes to Assessment instead of Review                            │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 8: Site and surroundings                                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment: "Edit site description"    ──Save/Back──▶ Review ✓ │
│                                                                                  │
│  ⚠️  Issue: Page title doesn't match section name                                │
│  ⚠️  Issue: "Save and come back later" wording                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 9 & 11: Planning considerations / Relevant policies                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment    ──Save──▶ Assessment ✗                           │
│          (both sections link here)        ──Back──▶ Assessment ✗                 │
│                                                                                  │
│  ⚠️  Issue: Both Save and Back go to Assessment                                  │
│  ⚠️  Issue: Two sections share same edit page                                    │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 10: Summary of advice                                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment: Same as Section 1    ──Save/Back──▶ Review ✓       │
│                   (bundled with Pre-application outcome)                         │
│                                                                                  │
│  ⚠️  Issue: Bundled with Section 1                                               │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 12: Requirements                                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──Edit──▶ Assessment    ──Save──▶ Assessment ✗                           │
│                                 ──Back──▶ Assessment ✗                           │
│                                                                                  │
│  ⚠️  Issue: Both Save and Back go to Assessment                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│ SECTIONS 13 & 14: Next steps / Disclaimer                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Review ──(no edit - system generated)──                                         │
│                                                                                  │
│  ✓ No issues                                                                     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary of Issues Found

| Section | Issue Type |
|---------|-----------|
| 1. Pre-application outcome | Bundled with wrong section, button wording |
| 3. Your pre-application details | Multiple edit points, wrong return, inconsistent buttons |
| 4. Description of your proposal | None (navigation correct) |
| 6. Relevant site constraints | Back goes to wrong place |
| 7. Relevant site history | Bug + Back goes to wrong place |
| 8. Site and surroundings | Inconsistent page title, button wording |
| 9 & 11. Planning considerations / Policies | Back + Save go to wrong place |
| 10. Summary of advice | Bundled with Section 1 |
| 12. Requirements | Both buttons go to wrong place |

---

## BUG TICKETS

### Related Bug Group: Wrong Return Destination

The following bugs are likely related and may share a common fix - the return URL is not being set correctly when navigating from Review context:

- Bug 2: Site visit → returns to Assessment dashboard
- Bug 3: Site constraints → Back returns to Validation
- Bug 4: Site history → Back returns to Assessment
- Bug 5: Planning considerations → Both buttons return to Assessment
- Bug 6: Requirements → Both buttons return to Assessment

**Potential common fix:** Ensure the referrer/return URL is passed and used when edit pages are accessed from Review context.

---

### Bug 1: Site history - Error page when adding new site history

**Title:** Relevant site history / Error page shown when adding new site history

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Relevant site history" section in the Review page, they are taken to an Assessment page showing site history. Clicking "Add a new site history" and submitting the form.

**Expected Result:**
New site history entry is saved and user is shown confirmation or returned to the site history list.

**Actual Result:**
An error page is displayed. However, if the user clicks the browser back button, the site history entry appears to have been saved successfully.

---

### Bug 2: Site visit - "Save and mark as complete" returns to Assessment dashboard

**Title:** Your pre-application details (Site visit) / Save returns to Assessment instead of Review

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Site visit" within "Your pre-application details" section, they go to Assessment page. After adding a site visit and clicking "Save and mark as complete".

**Expected Result:**
User is returned to the Review page where they initiated the edit.

**Actual Result:**
User is returned to the Assessment dashboard, requiring them to navigate back to Review manually.

---

### Bug 3: Site constraints - Back button returns to Validation

**Title:** Relevant site constraints / Back button returns to Validation instead of Review

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Relevant site constraints" section and then clicks the "Back" button.

**Expected Result:**
User is returned to the Review page where they initiated the edit.

**Actual Result:**
User is returned to Validation stage, requiring them to navigate back to Review manually.

---

### Bug 4: Site history - Back button returns to Assessment

**Title:** Relevant site history / Back button returns to Assessment instead of Review

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Relevant site history" section and then clicks the "Back" button.

**Expected Result:**
User is returned to the Review page where they initiated the edit.

**Actual Result:**
User is returned to Assessment stage, requiring them to navigate back to Review manually.

---

### Bug 5: Planning considerations - Back and Save buttons return to Assessment

**Title:** Planning considerations and advice / Navigation buttons return to Assessment instead of Review

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Planning considerations and advice" (or "Relevant policies and guidance") section. This affects both "Save and come back later" and "Back" buttons.

**Expected Result:**
Both buttons should return user to the Review page where they initiated the edit.

**Actual Result:**
Both buttons return user to Assessment stage, requiring them to navigate back to Review manually.

---

### Bug 6: Requirements - Both buttons return to Assessment

**Title:** Requirements / Navigation buttons return to Assessment instead of Review

**Feature/Process/Screen:**
When a Reviewer clicks Edit on "Requirements" section. This affects both "Save and mark as complete" and "Back" buttons.

**Expected Result:**
Both buttons should return user to the Review page where they initiated the edit.

**Actual Result:**
Both buttons return user to Assessment stage, requiring them to navigate back to Review manually.

---

## FEATURE TICKETS

---

### Feature 1: Consolidate "Your pre-application details" to single edit flow

**Title:** Consolidate Your pre-application details into single section edit

**What's the user need/story?**
As a Reviewer, I want to edit all elements of "Your pre-application details" (Site visit, Meetings) in one place, so that the editing experience is consistent with other sections that have a single "Edit" action.

**Why are we doing this? What is the problem?**
Currently this section has 3 separate edit links (Site visit, Meeting, Description of your proposal), which:
- Is inconsistent with other sections that have one Edit link
- Creates confusion about what is being edited
- Has inconsistent button styling (Site visit Add is primary, Meeting Add is secondary)
- Has inconsistent button labelling ("Add site visit response" vs "Add a new meeting")

The new design principle is "Edit by section, not by element".

**More details/context:**
- Description of your proposal will be moved to its own section (already done in new design)
- Site visit and Meetings could be combined into a single edit flow
- Consider whether these should be tasks completed together in Assessment stage

**Does anything need to be improved as part of this implementation?**
- Standardise button styling for "Add" actions
- Standardise button labelling (decide on pattern: "Add site visit" vs "Add a new site visit")

---

### Feature 2: Separate Summary of advice from Pre-application outcome edit

**Title:** Decouple Summary of advice from Pre-application outcome edit page

**What's the user need/story?**
As a Reviewer, when I click Edit on "Summary of advice" I expect to edit only that section, not be taken to a page that also includes Pre-application outcome editing.

**Why are we doing this? What is the problem?**
Currently, both "Pre-application outcome" (Section 1) and "Summary of advice" (Section 10) link to the same Assessment page for editing. This is confusing because:
- The Review sidebar shows them as separate sections to review
- Clicking Edit on one unexpectedly allows editing the other
- It's unclear which section you're actually editing

**More details/context:**
These are listed as separate sections in the Review page sidebar, so they should have separate edit flows.

---

### Feature 3: Remove or rename "Save and come back later" for Review context

**Title:** Review context-aware button labelling for edit pages

**What's the user need/story?**
As a Reviewer editing a section, I want button labels that make sense for my context, rather than labels designed for Assessors.

**Why are we doing this? What is the problem?**
When a Reviewer clicks Edit on a section, they are taken to Assessment/Validation pages that have "Save and come back later" buttons. This wording:
- Makes sense for an Assessor working through tasks over time
- Does NOT make sense for a Reviewer who is reviewing and making quick edits
- Creates confusion about the workflow

**More details/context:**
Affected sections:
- Pre-application outcome
- Site map
- Site and surroundings
- Planning considerations and advice

Options to consider:
1. Hide this button when accessed from Review context
2. Change label to "Save" (without the "come back later")
3. Context-aware labelling based on referrer

---

### Feature 4: Consistent page titles for edit screens

**Title:** Align edit page titles with Review section names

**What's the user need/story?**
As a Reviewer, when I click Edit on a section, I want the edit page title to match the section name so I know I'm in the right place.

**Why are we doing this? What is the problem?**
Currently there are inconsistencies:
- Section "Site and surroundings" → Edit page titled "Edit site description"

This creates confusion about whether you're editing the right thing.

**More details/context:**
Audit all edit page titles against Review section names and align them.

---

## SECTIONS WITH NO ISSUES

- Section 2: Officer contact details (no edit - correct)
- Section 4: Description of your proposal (navigation correct)
- Section 13: Next steps (no edit - system generated)
- Section 14: Disclaimer (no edit - system generated)

---

## SECTIONS SKIPPED (Future improvements planned)

- Section 9: Planning considerations and advice - overall improvements planned (but navigation bugs noted above)
- Section 11: Relevant policies and guidance - tied to Section 9
