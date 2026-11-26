# Wander Cafe + B&B: online ordering

Find your pause. Order ahead for pickup or dine-in, paid in full through PayMongo (GCash, Maya, card, QR Ph).

For now the site is the ordering page only, at every path. Room booking and the landing page are kept in the repo (`src/pages/Home.jsx`, `src/pages/StayPage.jsx`, `src/components/BookingForm.jsx`) but not shown.

Stack: Vite + React + Tailwind v4, a Cloudflare Worker (`worker/index.js`) serving the site and the `api/` routes, and the **dashboard's** Supabase project (WanderCafeDashboard-Monset).

## How it fits with the dashboard

Both apps use one Supabase project; the dashboard owns its schema.

- **Menu prices and availability come from the dashboard's Inventory.** Each item in `src/data/menu.js` has a POS `code` (CC01, FP02…). The page loads `/api/menu`, and checkout re-prices every order from Inventory on the server. To change a price, change it in the dashboard. To take something off the website, switch it off (inactive) in Inventory. An item whose code isn't in Inventory doesn't show.
- **`menu.js` still holds what Inventory doesn't:** photos, descriptions, choices (Spicy/Mild, ulam, add-ons) and categories. Its prices are only a fallback while the live menu loads.
- **A paid order becomes a POS sale on the dashboard's order board.** Checkout saves it in `orders` as pending; the PayMongo webhook calls the dashboard's `record_web_order` (its schema.sql section 12), which rings it up with the pickup time, phone and notes.

Adding a menu item: add a product in the dashboard's Inventory, then add the item to `menu.js` with the same `code` (and a photo in `public/food/`).

## Run it

```bash
npm install
cp .env.example .env.local   # the dashboard's Supabase URL + service key, PayMongo test keys
npm run dev                  # site + api/ routes on Vite
npm run check                # money, validation and webhook-signature checks
```

## Where things live

- `src/data/menu.js`: the menu, POS codes, item options, opening hours (**placeholder hours**)
- `src/lib/order.js`: pricing (live Inventory prices), validation, pickup times; shared by the page and the server
- `api/menu.js`: today's prices and what's on, from Inventory
- `api/checkout.js`: re-prices the order, saves it as pending, opens the PayMongo Checkout Session
- `api/paymongo-webhook.js`: the only place an order becomes paid (signature-checked), via the dashboard's database
- `worker/index.js`, `wrangler.jsonc`: the Cloudflare Worker

## Go live (Cloudflare)

1. **Inventory:** in the dashboard's Supabase › SQL Editor, run `supabase/dashboard-new-items.sql` once (the What's New items).
2. **Worker:** `npx wrangler login`, then `npm run deploy`. Or connect the GitHub repo in Cloudflare › Workers & Pages (build command `npm run build`, deploy command `npx wrangler deploy`).
3. **Secrets:** Cloudflare › Workers › wandercafe-monset › Settings › Variables and Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (same as the dashboard Worker's), `PAYMONGO_SECRET_KEY`, `PAYMONGO_WEBHOOK_SECRET`, and `SITE_URL` once the domain is set.
4. **Domain:** Settings › Domains & Routes › add the custom domain.
5. **PayMongo webhook:** register `https://<your-domain>/api/paymongo-webhook` for `checkout_session.payment.paid`:
   ```bash
   curl https://api.paymongo.com/v1/webhooks -u sk_test_xxx: \
     -H "content-type: application/json" \
     -d '{"data":{"attributes":{"url":"https://<your-domain>/api/paymongo-webhook","events":["checkout_session.payment.paid"]}}}'
   ```
   Put the returned `secret_key` in `PAYMONGO_WEBHOOK_SECRET`. Test and live mode need separate webhooks.
6. **Order notifications:** in Supabase › Database › Webhooks, add an **Update** webhook on table `orders`, HTTP POST to `https://dashboard.wanderbyfleur.com/api/notify` with header `x-webhook-secret: <the dashboard's WEBHOOK_SECRET>`.
7. **Test** with a PayMongo test payment: order a coffee for today. It should appear on the dashboard's order board as *Website*.
8. Before launch: real opening hours in `menu.js`.
