---
description: Write and run tests for a spec
argument-hint: "Spec file name e.g. 04-contact-us"
allowed-tools: Read, Write, Glob, Bash, Grep
---

Run the full testing pipeline for the feature specified
in $ARGUMENTS.

If no argument is provided, stop immediately and say:
"Please provide a spec name. Usage: /test-spec <spec-name> e.g. /test-spec 04-contact-us"

If `.claude/specs/$ARGUMENTS.md` does not exist, stop
immediately and say:
"Spec file not found at .claude/specs/$ARGUMENTS.md. Please check the spec name and try again."

---

## Step 1: Determine the project

Read the spec at `.claude/specs/$ARGUMENTS.md` and determine which project it targets:

- **Frontend** (`frontend/`) — React components, pages, client-side logic
- **Backend** (`backend/`) — API endpoints, database, server logic

Set `$PROJECT_DIR` and `$PROJECT_TYPE` accordingly.

---

## Step 2: Write Tests

Invoke the **test-writer** subagent with the following context:

- Spec file to base tests on: `.claude/specs/$ARGUMENTS.md`
- Project type: `$PROJECT_TYPE` (frontend or backend)
- Project directory: `$PROJECT_DIR`
- Source files to read for structure:
  - Frontend: relevant component files in `frontend/src/`
  - Backend: `backend/index.js` and related files
- Output test files to create:
  - Frontend: `frontend/src/<feature>/<Component>.test.tsx`
  - Backend: `backend/__tests__/<feature>.test.js`
- Instruction: Write tests based on what the spec says the feature SHOULD do. Do NOT derive test logic from reading the implementation. Cover happy paths, edge cases, auth guards, validation errors, and UI states.

Wait for test-writer to fully complete and confirm the test files have been written before proceeding.

---

## Step 3: Run Tests

Once test-writer has finished, invoke the **test-feature** subagent with the following context:

- Test files to execute: list of files created in Step 2
- Project directory: `$PROJECT_DIR`
- Project type: `$PROJECT_TYPE`
- Spec file for context: `.claude/specs/$ARGUMENTS.md`
- Run command: `cd $PROJECT_DIR && npx vitest run --reporter=verbose`
- Instruction: Run ONLY the specified test files. Do NOT run the full test suite. Analyze any failures by cross-referencing the test code, the spec, and the source files. Classify each failure as a bug or a missing feature.

---

## Handoff Rules

- Do NOT start Step 3 until Step 2 is fully complete
- Do NOT attempt to fix any code regardless of what the test results show
- Do NOT run any tests beyond the files created in Step 2
- If test-writer reports it could not write the test files, stop and report the reason — do NOT proceed to Step 3

---

## Final Output

After both subagents complete, produce a combined summary:

### Testing Pipeline Report — $ARGUMENTS

**Step 1 — Tests Written**

- List each test file created with a one-line description of which spec requirement it validates

**Step 2 — Test Results**

- Mirror the test-feature agent's structured report

**Verdict**
One of:

- ✅ Ready for code review — all tests pass
- ❌ Needs fixes — list the failing tests and their root causes
