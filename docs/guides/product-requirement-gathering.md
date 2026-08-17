# Product Requirement Gathering Guide

Guide for using `/scout:product-requirement`.

## Invocation

Run in your agent harness:
```bash
/scout:product-requirement <prompt>
```

### Example Prompt
```text
I want to build a web app for freelance photographers to manage client bookings, deliverables, and invoicing in one place. Most juggle Calendly, Dropbox, and a separate invoicing tool. Team is just me and one other engineer, aiming for a paid SaaS.
```

---

## Execution Flow

1. **Delta Fan-Out**:
   - The skill scans `scoutspec/context.md`.
   - Dispatches 4 parallel agents (Business, Team, Competitors, Customer Pain).
   - Competitor agent performs live web searches for verified platforms (e.g., HoneyBook, Pixieset).

2. **Synthesis & Context Sync**:
   - Compiles research into `scoutspec/requirements/<slug>/synthesis.md`.
   - Syncs newly identified domain insights into `scoutspec/context.md`.

3. **Frontier Grilling**:
   - Serves 1-3 high-impact questions per turn in chat.
   - User replies with selections or types `done` to finalize.
   - Full Q&A audit trail saved to `scoutspec/requirements/<slug>/grilling.md`.

4. **Proposal & Spec Handoff**:
   - Generates `proposal.md` and initial delta `specs/`.
   - Sets status to `ready` in `meta.yaml` and `index.yaml`.
