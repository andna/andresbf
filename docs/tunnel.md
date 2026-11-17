# Cloudflare quick tunnel

A tunnel is not part of the app and does not start when someone clones the repo. It is a local `cloudflared` process that forwards a temporary public URL to the dev server on that machine. Cloning only gets the source, including the Vite host allowlist below.

## What the repo does

`astro.config.mjs` sets `vite.server.allowedHosts` to `.trycloudflare.com`. Vite otherwise rejects the tunnel's `Host` header, so the page never loads through the public URL. That setting does not install or run `cloudflared`.

## Run one

1. Install the [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) binary on the machine that will serve the site.
2. Start the dev server:

```bash
npm run dev -- --port 4321 --host 127.0.0.1
```

3. In another terminal, point a quick tunnel at it:

```bash
cloudflared tunnel --url http://127.0.0.1:4321
```

`cloudflared` prints a `*.trycloudflare.com` URL. It lasts only while that process is running, and the next run gets a new URL. This form does not need a Cloudflare account, a named tunnel, or a secret in the repo.
