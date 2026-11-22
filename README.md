# Game Guide Tracker

Self-hosted, mobile-friendly checklist tracker for game achievement and walkthrough guides. Upload YAML guides, start a playthrough, and check items off with per-playthrough progress history.

Repository: [https://github.com/TashreeqPeck/game-guide](https://github.com/TashreeqPeck/game-guide)

## Local development

1. Copy `.env.example` to `.env` (defaults use dev sign-in — no OIDC provider required).
2. `npm ci --engine-strict=false`
3. `npm run db:reset` (optional, creates `./data/app.db`)
4. `npm run dev` — Vite dev server at `http://localhost:5173`
5. Open `/auth/login` to sign in as `dev@localhost` when `AUTH_MODE=dev`.
6. `npm run seed:dev` imports everything in `samples/` for the dev user.
7. `npm test` — unit tests (no network/OIDC required).

`AUTH_MODE=dev` is refused when `NODE_ENV=production` (see tests).

### Optional full OIDC locally

```bash
docker compose -f docker-compose.dev.yml up -d
```

Set in `.env`:

- `AUTH_MODE=oidc`
- `OIDC_ISSUER=http://localhost:8080/default`
- `OIDC_CLIENT_ID=default`
- `OIDC_CLIENT_SECRET=secret`
- `ORIGIN=http://localhost:5173`

### Other commands

- `npm run lint` / `npm run check` / `npm run build`
- `npm run seed:dev` / `npm run db:reset`

## Importing guides

Use **Import guide** in the app and upload `.yaml` / `.yml` files. See the in-app format reference. Sample files live in [`samples/`](samples/).

## Production (Docker)

Image: `ghcr.io/tashreeqpeck/game-guide` (published on semantic-release versions).

1. Copy `.env.example` to `.env` and set `AUTH_MODE=oidc`, `ORIGIN`, and OIDC variables. Callback: `${ORIGIN}/auth/callback`
2. `docker compose pull && docker compose up -d`
3. Pull needs `docker login ghcr.io` with a `read:packages` token unless the package is public.

Set `MAX_UPLOAD_BYTES` (default 2MB) and ensure your reverse proxy allows the same upload size.

## Commits and releases

- Strict [Conventional Commits](https://www.conventionalcommits.org/) (commitlint + husky).
- Releases and GHCR images are created by GitHub Actions on `main` when commits include `feat` / `fix` / breaking changes.
- Merges to `main` use **rebase** only so atomic commits stay intact.

## Health

`GET /health` returns `{ ok: true, version }` where `version` is `APP_VERSION`.