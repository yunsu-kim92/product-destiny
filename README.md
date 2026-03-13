# K-Destiny

## Preview Environment

Local Cloudflare Pages preview:

1. Copy `.dev.vars.example` to `.dev.vars`
2. Fill in `OPENAI_API_KEY` and prompt values if you want the Functions API to use OpenAI during preview
3. Run:

```bash
npm run preview:pages
```

This preview serves the production build through `wrangler pages dev`, so it is the closest local match to the deployed Pages environment.

SPA subpages such as `/about`, `/privacy`, `/terms`, `/refund`, and `/contact` are routed through `public/_redirects`.

## Supabase Auth

Email/password sign-up and login are wired with `@supabase/supabase-js`, and the local workflow is exposed through Supabase CLI scripts.

1. Copy `.env.example` to `.env.local`
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Initialize Supabase once:

```bash
npm run supabase:init
```

4. Start the local stack when Docker is available:

```bash
npm run supabase:start
```

5. Check local URLs and keys:

```bash
npm run supabase:status
```

If the Vite auth env vars are missing, the app still renders but the auth dialog explains that Supabase has not been configured yet. The client now expects `VITE_SUPABASE_PUBLISHABLE_KEY` and still accepts `VITE_SUPABASE_ANON_KEY` as a fallback for compatibility.

### Google login

The auth modal also supports Google OAuth through Supabase.

1. In Google Auth Platform, create a `Web application` OAuth client
2. Add your app origins to `Authorized JavaScript origins`
3. Add the Supabase callback URL from the Google provider page in the Supabase Dashboard to `Authorized redirect URIs`
4. In Supabase Dashboard, enable the Google provider and save the Google client ID and client secret
5. Keep your app URL in Supabase Auth URL Configuration allow-lists for both production and local development

For local Supabase CLI development, the official callback URL is `http://127.0.0.1:54321/auth/v1/callback`.

# React + TypeScript + Vite

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
