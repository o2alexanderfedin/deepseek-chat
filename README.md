# DeepSeek Chat

A React + TypeScript chat application built with Vite.

## Git Flow Workflow

This project uses Git Flow branching model. Direct commits to `main` are blocked.

### Branches
- **main**: Production-ready code only. Deploys to GitHub Pages.
- **develop**: Active development branch.

### Workflow

1. **Feature Development**
   ```bash
   git checkout develop
   git checkout -b feature/your-feature
   # Make changes and commit
   git checkout develop
   git merge feature/your-feature
   git branch -d feature/your-feature
   ```

2. **Release**
   ```bash
   git checkout develop
   git checkout -b release/v1.0.0
   # Final testing and version bumps
   git checkout main
   git merge release/v1.0.0
   git tag v1.0.0
   git checkout develop
   git merge release/v1.0.0
   git branch -d release/v1.0.0
   ```

3. **Hotfix**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-fix
   # Fix the issue
   git checkout main
   git merge hotfix/critical-fix
   git tag v1.0.1
   git checkout develop
   git merge hotfix/critical-fix
   git branch -d hotfix/critical-fix
   ```

## CI/CD

- Tests run on all pushes and PRs
- Deployment to GitHub Pages on push to main
- Live site: https://o2alexanderfedin.github.io/deepseek-chat/

## Development

```bash
npm install
npm run dev     # Start dev server
npm run test    # Run tests
npm run lint    # Run linter
npm run build   # Build for production
```

---

## Technical Details

### React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
