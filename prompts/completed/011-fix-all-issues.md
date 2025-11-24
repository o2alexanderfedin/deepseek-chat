<objective>
Fix ALL failing tests, linting errors, and any other issues in the deepseek-chat project.

No excuses - every test must pass, every linting error must be resolved, and the project must be in a clean, working state.
</objective>

<context>
This is a React/TypeScript chat application at /Users/alexanderfedin/Projects/hapyy/experiments/DeepSeek/deepseek-chat

Known issues to fix:
1. 6 failing tests in webllm.test.ts - temperature tests expecting 0.7 but getting 0 (DEFAULT_TEMPERATURE was changed to 0)
2. ESLint configuration issues (missing typescript-eslint package)
3. Any other failing tests or issues

Read the CLAUDE.md at /Users/alexanderfedin/Projects/hapyy/CLAUDE.md for project conventions.
</context>

<requirements>
1. Run all tests and identify every failure
2. Fix each failing test - update test expectations to match actual behavior
3. Fix ESLint configuration so `npm run lint` works
4. Ensure `npm run build` succeeds
5. Ensure ALL tests pass with `npm run test`
6. Document what was fixed
</requirements>

<implementation>
1. First, run `npm run test` and capture all failures
2. For the temperature tests: Update test expectations from 0.7 to 0 since DEFAULT_TEMPERATURE is now 0
3. For ESLint: Install missing packages or fix configuration
4. For any other failures: Investigate and fix the root cause
5. Re-run tests until all pass
6. Run lint and build to verify everything works

Be thorough - check every test file, every configuration file. Leave nothing broken.
</implementation>

<verification>
Run these commands and ensure all succeed with zero errors:

1. `npm run test` - ALL tests must pass (0 failures)
2. `npm run lint` - Zero linting errors
3. `npm run build` - Build must succeed

If any command fails, continue fixing until it passes.
</verification>

<success_criteria>
- `npm run test` shows 0 failures
- `npm run lint` shows 0 errors
- `npm run build` completes successfully
- No TypeScript errors
- Project is in clean, working state
</success_criteria>
