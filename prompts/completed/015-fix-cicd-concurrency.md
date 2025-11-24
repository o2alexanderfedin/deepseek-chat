<objective>
Fix the CI/CD workflow concurrency settings that cause build/deploy jobs to be cancelled when multiple pushes happen in quick succession.

The current `cancel-in-progress: true` setting is too aggressive - it cancels build/deploy even when tests pass, which breaks the deployment.
</objective>

<context>
File: `.github/workflows/ci-cd.yml`

Current problematic setting:
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: true
```

This causes issues when:
1. Push to develop triggers workflow
2. Push to main triggers another workflow
3. Second workflow cancels first's build/deploy jobs

The test job completes but build/deploy get cancelled.
</context>

<requirements>
1. **Keep concurrency protection** for deploy job (avoid duplicate deployments)
2. **Don't cancel test or build jobs** that are in progress
3. **Only cancel duplicate deploy jobs** to the same environment

Options to consider:
- Use branch-specific concurrency groups
- Move concurrency to deploy job only
- Use `cancel-in-progress: false` for non-deploy jobs
</requirements>

<implementation>
Recommended fix - use branch-specific concurrency group:

```yaml
concurrency:
  group: "pages-${{ github.ref }}"
  cancel-in-progress: false
```

Or move concurrency to deploy job only:

```yaml
jobs:
  test:
    # no concurrency - let all tests run

  build:
    # no concurrency - let all builds run

  deploy:
    concurrency:
      group: "pages-deploy"
      cancel-in-progress: true
    # ... rest of deploy job
```
</implementation>

<output>
Modify: `.github/workflows/ci-cd.yml`
</output>

<verification>
1. Push a change and verify all jobs complete (test → build → deploy)
2. Check that rapid pushes don't cancel in-progress builds unnecessarily
</verification>

<success_criteria>
- Test job always completes
- Build job always completes after test passes
- Deploy job completes for main branch pushes
- No unnecessary job cancellations
</success_criteria>
