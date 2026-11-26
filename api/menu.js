import { json, loadMenu } from "./_db.js";

// GET /api/menu: today's prices and what's on the menu, from the dashboard's Inventory, for the order page.
// [{ code, price, active }]. The page falls back to menu.js prices if this fails; checkout never does.
export async function GET() {
  const menu = await loadMenu();
  if (!menu) return json({ error: "Menu unavailable" }, 503);
  return Response.json(menu, { headers: { "cache-control": "public, max-age=60" } });
}
