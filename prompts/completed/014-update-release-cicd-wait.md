<objective>
Update the `/release` slash command to wait for the CI/CD pipeline to complete successfully before finishing, instead of just checking the status.

Currently the command shows `gh run list --limit 3` to display recent runs but doesn't wait for completion. The command should poll the CI/CD status until it either passes or fails, providing clear feedback to the user.
</objective>

<context>
The `/release` slash command is located at: `~/.claude/commands/release.md`

This is a global Claude Code slash command that executes git flow releases. It currently:
1. Commits changes
2. Creates release branch
3. Merges to main and develop
4. Pushes and creates GitHub release
5. Shows recent CI runs (but doesn't wait)

The command uses `gh` CLI for GitHub operations.
</context>

<requirements>
1. **Wait for CI/CD completion**:
   - After pushing to main, poll the CI/CD workflow status
   - Use `gh run watch` or poll `gh run list` with status checks
   - Maximum wait time: 10 minutes (configurable)
   - Poll interval: 10-15 seconds

2. **Provide user feedback**:
   - Show progress while waiting (e.g., "Waiting for CI/CD... (30s)")
   - Display final status: success, failure, or timeout

3. **Handle failure cases**:
   - If CI/CD fails: show error details and provide link to the failed run
   - If timeout: warn user but don't fail the release (it's already pushed)

4. **Maintain existing functionality**:
   - All current release steps should continue working
   - Only add the wait/verification step at the end
</requirements>

<implementation>
Update the verification section to include active waiting:

```bash
# Get the run ID for the main branch push
run_id=$(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId')

# Wait for completion with timeout
echo "Waiting for CI/CD pipeline to complete..."
gh run watch $run_id --exit-status || {
  echo "CI/CD pipeline failed. Check: gh run view $run_id"
  exit 1
}
```

Alternative polling approach if `gh run watch` is not suitable:
```bash
timeout=600  # 10 minutes
elapsed=0
interval=15

while [ $elapsed -lt $timeout ]; do
  status=$(gh run list --branch main --limit 1 --json status,conclusion -q '.[0]')
  # Check if completed and report
  sleep $interval
  elapsed=$((elapsed + interval))
done
```
</implementation>

<output>
Modify file: `~/.claude/commands/release.md`

Update the verification/success_criteria section to wait for CI/CD completion.
</output>

<verification>
Test the updated command by:
1. Making a small change and running `/release`
2. Verify it waits for CI/CD to complete
3. Confirm it shows success/failure status
4. Test timeout behavior (optional)
</verification>

<success_criteria>
- Command waits for CI/CD pipeline to complete
- Shows clear progress feedback during wait
- Reports success or failure with actionable information
- Doesn't hang indefinitely (has timeout)
- Maintains all existing release functionality
</success_criteria>
