# Hosting Garden Goods (canopy-goods)

Fork of Ocean Market. **Node.js + Express + MySQL** as a **Docker Compose** stack. GitHub Actions rsyncs the tree and runs `docker compose up --build -d` on the VPS.

Production:

- VPS `root@74.208.35.191` → `/var/www/canopy-goods`
- Container published as `127.0.0.1:4842` (`HOST_BIND=127.0.0.1`, `PORT=4842`)
- nginx reverse-proxies **gardengoods.adavis.shop** and **gg.adavis.shop** → that loopback port
- MySQL: Aiven database `canopy` (same host as ocean-market; see server `.env`)
- Local compose sidecar MySQL (dev) binds `127.0.0.1:3308` — do **not** reuse ocean’s `:3307` / app `:4840` / chllc `:4841`

## Bind map (zen88)

| Port | Owner |
|------|--------|
| 4840 | ocean-market |
| 4841 | chllc |
| **4842** | **canopy-goods / Garden Goods** |
| 3307 | ocean-market mysql sidecar |
| **3308** | **canopy-goods mysql sidecar** |

## GitHub Actions

Workflow: `.github/workflows/deploy.yml`  
Secret: `SSH_PRIVATE_KEY` (authorized for `root@74.208.35.191`)

On the server, create once and leave in place:

- `/var/www/canopy-goods/.env`
- `/var/www/canopy-goods/public/uploads`

Nginx example: [`deploy/nginx-gardengoods.conf`](./deploy/nginx-gardengoods.conf)

## Health

`http://127.0.0.1:4842/healthz` on the VPS (and `/healthz` via the public hostnames after TLS).
