# Deploy SONARA as one Node web service

The React frontend and `/room` WebSocket backend need to share a host. Static-only hosting will not run the existing room server. `render.yaml` at repository root defines the full service.

## Render blueprint

Open https://dashboard.render.com/blueprint/new?repo=https://github.com/lily1c/sonara and sign in. Review GitHub authorization and any provider terms yourself. Choose a Blueprint name, review the service and select the Free plan. Do not add paid databases, disks or other resources for this demo.

The blueprint sets:

- Root directory: `sonara`
- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Node 22, health endpoint `/health`, runtime `PORT` supplied by Render
- A generated private `SONARA_ISSUER_SEED` to preserve receipt signatures across restarts

GitHub source is public. Keep secret environment variables exclusively in the host dashboard; never commit them. Do not expose the issuer seed to client-side code. Render's automatic `RENDER_EXTERNAL_URL` supplies the public origin for metadata and invitations, so the app does not require a tunnel or the laptop to stay open. Optional `SONARA_PUBLIC_URL` can override it with a custom HTTPS domain.

After deployment, check the live homepage, `/health`, `/api/issuer`, `/musician/metadata.json` and its image, then run:

```sh
cd sonara
npm run check:public -- https://YOUR-SERVICE.onrender.com
```

That checks actual room joins, reactions, note events and synthetic preview delivery. Verify the same issuer public key after redeploy. Approve a Devnet mint/claim yourself before claiming wallet end-to-end validation.

## Free service limits

Render Free web services have stable HTTPS addresses but may spin down after inactivity and take about a minute to wake. In-memory rooms and unclaimed takes reset on process restarts; the configured issuer identity survives because it comes from a persistent environment secret. Monthly usage limits apply. A stable free URL is not an uptime guarantee or a production SLA. Keep the service running on one instance; shared room storage is required before horizontal scaling.

Official references: https://render.com/docs/websocket, https://render.com/docs/deploy-node-express-app, https://render.com/docs/blueprint-spec, https://render.com/docs/free.
