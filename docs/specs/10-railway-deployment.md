# Railway Deployment (CLI-First)

## Goal

Deploy and operate the app as a single Railway service with the API serving the compiled frontend from `/` and JSON endpoints from `/api`.

---

## Service Model

Single Railway project containing:

- one `api` service (`apps/api`)
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
MAGIC_LINK_SECRET
PORT
```

---

## One-Time Setup

1. Install Railway CLI and authenticate.
2. Link this repo to the Railway project from repo root.
3. Ensure the service exists in Railway and note the exact service name from `railway service list`.
   - Current project uses `@condition-tracker/api`
4. If `railway status` shows `Service: None`, either:
   - use explicit `--service <name>` flags in commands, or
   - run `railway service link <name>` to set a default service context.
5. Verify the service points at its deploy config file:
   - `apps/api/railway.toml`

---

## Deploy Runbook

Run from repo root.

1. Preflight local validation:

```bash
pnpm deploy:preflight
```

2. Deploy the single service:

```bash
pnpm deploy:api
```

3. Inspect logs until healthy:

```bash
pnpm deploy:logs:api
```

4. Optional single command path (preflight + deploy):

```bash
pnpm deploy:all
```

---

## Health Checks

- API health endpoint: `/health`
- Web root route: `/`

Expected behavior:

- API returns a 200 JSON payload for `/health`
- The frontend returns `index.html` for `/` and client routes

---

## Dashboard Steps (Networking Only)

Use dashboard only for domain mapping and ports.

1. Assign the public domain to the API service internal port.
2. Do not append ports to public URLs.
3. Keep the healthcheck path configured as above.

---

## Fast Triage

If a deploy fails, check in this order:

1. Wrong service target name (`api`) in CLI command.
2. Runtime crash before bind (inspect logs for module resolution or startup errors).
3. Healthcheck path mismatch.
4. Incorrect environment variable values (storage/database secrets).
5. Monorepo output mismatch (frontend build must exist at `apps/web/dist` when the API starts).

---

## Future Improvements

```txt
Preview environments
CI/CD deploy gates
Separate worker service
Monitoring and alerting
Centralized log retention
```
