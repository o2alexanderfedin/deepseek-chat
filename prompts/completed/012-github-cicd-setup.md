<objective>
Configure GitHub repository with branch protection, git flow enforcement, and CI/CD deployment to GitHub Pages.

This ensures code quality through protected branches, consistent workflow, and automated deployments.
</objective>

<context>
This is a React/TypeScript chat application at /Users/alexanderfedin/Projects/hapyy/experiments/DeepSeek/deepseek-chat

GitHub repo: https://github.com/o2alexanderfedin/deepseek-chat
Branches: main (production), develop (development)

The project uses:
- Vite for building
- npm for package management
- Git flow branching model

Read the CLAUDE.md at /Users/alexanderfedin/Projects/hapyy/CLAUDE.md for project conventions.
</context>

<requirements>
1. **Branch Protection for main:**
   - Prohibit direct commits to main
   - Require pull request before merging
   - Require status checks to pass (CI)
   - Use GitHub CLI (gh) to configure

2. **Git Flow Enforcement:**
   - Add pre-commit hook to prevent commits directly to main
   - Document the git flow workflow in README

3. **CI/CD to GitHub Pages:**
   - Create GitHub Actions workflow
   - Run tests on all pushes and PRs
   - Build and deploy to GitHub Pages on push to main
   - Configure Vite for GitHub Pages base path
</requirements>

<implementation>
1. **Branch Protection (via gh CLI):**
   ```bash
   gh api repos/{owner}/{repo}/branches/main/protection -X PUT -f ...
   ```
   - Require PR reviews
   - Require status checks
   - Restrict who can push

2. **Git Hooks:**
   - Create `.husky/pre-commit` hook that blocks commits to main
   - Install husky: `npm install -D husky`
   - Initialize: `npx husky init`

3. **GitHub Actions Workflow:**
   - Create `.github/workflows/ci-cd.yml`
   - Jobs: test, build, deploy
   - Use `actions/deploy-pages` for GitHub Pages
   - Configure concurrency to cancel in-progress deployments

4. **Vite Configuration:**
   - Update `vite.config.ts` with `base: '/deepseek-chat/'` for GitHub Pages
   - Ensure build outputs to `dist/`

5. **Enable GitHub Pages:**
   - Use gh CLI to enable Pages with GitHub Actions as source
</implementation>

<output>
Create new files:
- `.github/workflows/ci-cd.yml` - GitHub Actions workflow
- `.husky/pre-commit` - Git hook to block main commits

Modify existing files:
- `vite.config.ts` - Add base path for GitHub Pages
- `package.json` - Add husky dependency and prepare script
- `README.md` - Document git flow workflow

Run commands:
- Install husky
- Configure GitHub branch protection via gh CLI
- Enable GitHub Pages via gh CLI
</output>

<verification>
1. Try to commit directly to main - should be blocked by hook
2. Push to develop and verify CI runs tests
3. Create a release and merge to main
4. Verify GitHub Pages deployment at https://o2alexanderfedin.github.io/deepseek-chat/
5. Check branch protection is active in GitHub settings
</verification>

<success_criteria>
- Direct commits to main blocked locally (git hook)
- Direct pushes to main blocked on GitHub (branch protection)
- CI runs tests on all pushes
- GitHub Pages deploys automatically on main updates
- App accessible at GitHub Pages URL
</success_criteria>
