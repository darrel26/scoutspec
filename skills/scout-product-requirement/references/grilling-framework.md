# Question Frontier & Grilling Framework

## 1. What is the Question Frontier?
The Question Frontier is an ordered queue of critical ambiguities extracted from the 4 research agent reports. Instead of interrogating the user with 15 questions simultaneously, questions are prioritized by decision severity and delivered in small interactive batches.

## 2. Risk Tiers
- **Tier 1: Architectural & Business Blockers (Must-Ask)**
  - Monetization gate (e.g., free tier vs paywall upfront)
  - Core target persona definition
  - Primary single-feature differentiator vs established competitors
- **Tier 2: Scope & Execution Constraints (Should-Ask)**
  - MVP boundaries / cut lines
  - Third-party integrations vs custom builds
  - Team capacity vs delivery target
- **Tier 3: Polish & Future Roadmap (Deferrable)**
  - Advanced analytics, secondary notifications, niche export formats

## 3. Grilling Turn Format
Each turn presents 1 to 3 prioritized frontier questions:

```markdown
### Grilling Turn (Round X/3)

1. **[Question Title]**
   - **Context**: Why this matters (impact on architecture or business).
   - **Options**:
     - A: Option 1 description
     - B: Option 2 description
     - C: Custom answer

*(Reply with your choice, provide details, or type `done` to finalize the spec.)*
```

## 4. Exit Criteria
- **Frontier Clean**: All Tier 1 and critical Tier 2 questions answered.
- **User Override**: User inputs `done`, `finish`, `stop`, or `generate spec`.
- **Safety Cap**: Round 3 completes.
