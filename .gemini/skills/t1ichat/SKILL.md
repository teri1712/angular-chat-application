---
name: /t1ichat-way-of-working
description: Executes the standard T1ichat development lifecycle through incremental builds to regression-tested completion. Use when starting any code change, feature implementation, or bug fix for the T1ichat Client.
---

# T1ichat Way of Working

### 1. Incremental Implementation (the "Agile Mental")

- **Reasonable increment**: Don't try to make increment to be extreme either fine-grain or coarse-grain, group
  reasonable
  work that could be fit and handled in a single task

### 2. Testing (mandatory)

- **Specification**: Your new proposal must be validated via e2e test specs, you might need to write e2e test to make
  sure
  UI/UX reflect correctly upon the api it calls, implementing test isnt just to make sure
  app works, it is defining what you have done, our expectation, facts that couldnt be wrong and helping regression.
- **E2E Guard**: Run all Cypress E2E tests.
- **Requirement**: All tests **must pass** before the increment is considered safe.

### 3. Definition of Done (DoD) mindset of EVERY SINGLE PROMPT

- [ ] All new and existing tests pass. Don't try to overthinking whether your new code break old code, running tests are
  the most important reliable mindset to know whether the changes are safe instead of overthinking.

### 4. Approval

- [ ] Work is summarized (what was done, what issues were resolved).
- [ ] User approval received ("approved").
- [ ] Changes committed with detailed messages (including backend commit hashes).
