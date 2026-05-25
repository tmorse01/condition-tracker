# Railway Deployment (CLI-First)

## Goal

Deploy and operate the two-service monorepo (`api` + `web`) with Railway CLI as the primary workflow.

---

## Service Model

Single Railway project containing:

- `api` service (`apps/api`)
- `web` service (`apps/web`)
- PostgreSQL
- private object storage

---

## Required Environment Variables

```txt
DATABASE_URL
STORAGE_BUCKET_NAME
STORAGE_ACCESS_KEY_ID
STORAGE_SECRET_ACCESS_KEY
STORAGE_ENDPOINT
STORAGE_REGION
APP_BASE_URL
API_BASE_URL
MAGIC_LINK_SECRET
```

---

## One-Time Setup

1. Install Railway CLI and authenticate.
2. Link this repo to the Railway project from repo root.
3. Ensure both services exist in Railway and note the exact service names from `railway service list`.
   - Current project uses `@condition-tracker/api`
   - Current project uses `@condition-tracker/web`
4. If `railway status` shows `Service: None`, either:
   - use explicit `--service <name>` flags in commands, or
   - run `railway service link <name>` to set a default service context.
5. Verify each service points at its own deploy config file:
   - `apps/api/railway.toml`
   - `apps/web/railway.toml`

---

## Deploy Runbook

Run from repo root.

1. Preflight local validation:

```bash
pnpm deploy:preflight
```

2. Deploy API first:

```bash
pnpm deploy:api
```

3. Inspect API logs until healthy:

```bash
pnpm deploy:logs:api
```

4. Deploy Web second:

```bash
pnpm deploy:web
```

5. Inspect Web logs until healthy:

```bash
pnpm deploy:logs:web
```

6. Optional single command path (preflight + both deploys):

```bash
pnpm deploy:all
```

---

## Health Checks

- API health endpoint: `/health`
- Web health endpoint: `/`

Expected behavior:

- API returns a 200 JSON payload for `/health`
- Web returns `index.html` for `/`

---

## Dashboard Steps (Networking Only)

Use dashboard only for domain mapping and ports.

1. Assign API public domain to the API service internal port.
2. Assign Web public domain to the Web service internal listening port.
3. Do not append ports to public URLs.
4. Keep healthcheck paths configured as above.

---

## Fast Triage

If a deploy fails, check in this order:

1. Wrong service target name (`api`/`web`) in CLI command.
2. Runtime crash before bind (inspect logs for module resolution or startup errors).
3. Healthcheck path mismatch.
4. Incorrect environment variable values (`API_BASE_URL`, `APP_BASE_URL`, storage/database secrets).
5. Monorepo output mismatch (workspace package exports must resolve to compiled `dist` assets in runtime).

---

## Future Improvements

```txt
Preview environments
CI/CD deploy gates
Separate worker service
Monitoring and alerting
Centralized log retention
```
