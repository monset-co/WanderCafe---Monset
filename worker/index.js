// Cloudflare Worker: serves the built site from dist/ (wrangler.jsonc › assets) and runs the api/ routes.
// The handlers are Web-standard (Request in, Response out) and read process.env, so this copies the
// Worker's variables and secrets there. Set them in Cloudflare › Settings › Variables and Secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   the dashboard's Supabase project (same as the dashboard Worker)
//   PAYMONGO_SECRET_KEY, PAYMONGO_WEBHOOK_SECRET, SITE_URL (optional)
import process from "node:process";
import * as checkout from "../api/checkout.js";
import * as menu from "../api/menu.js";
import * as status from "../api/status.js";
import * as webhook from "../api/paymongo-webhook.js";

// Room booking (api/availability.js, the booking half of checkout) stays off until the B&B goes online.
const ROUTES = { "/api/checkout": checkout, "/api/menu": menu, "/api/status": status, "/api/paymongo-webhook": webhook };

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const route = ROUTES[pathname];
    if (!route) return pathname.startsWith("/api/") ? Response.json({ error: "Not found" }, { status: 404 }) : env.ASSETS.fetch(request);
    const handler = route[request.method];
    if (!handler) return Response.json({ error: "Method not allowed" }, { status: 405 });

    for (const [k, v] of Object.entries(env)) if (typeof v === "string") process.env[k] = v;
    try {
      return await handler(request);
    } catch (e) {
      console.error(pathname, e);
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  },
};
