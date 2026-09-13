# Canopy Goods

Plant-forward storefront forked from [Ocean Market](https://github.com/KiryuCode/ocean-market) at `db6a418`.

- **Default store name:** Canopy Goods
- **Backup display name:** Citrus & Fern — swap anytime from **Admin → Store name** (no code push)
- **GitHub Actions:** disabled (no `.github/workflows` until a deploy target is ready)

## Local

```bash
cp .env.example .env
npm install
npm start
```

Admin: `/admin` — set `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` in `.env`.

## Notes for bb5

Skin/CSS in `public/css/` — garden/plant palette welcome. Keep the public name coming from `storeName` / admin settings, not hard-coded strings.
