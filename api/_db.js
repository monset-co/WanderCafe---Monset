// Supabase, spoken to directly over its REST API (PostgREST) with the service key: no SDK needed.
// It's the DASHBOARD's project (WanderCafeDashboard-Monset/supabase/schema.sql owns the schema): the website
// reads Inventory prices and writes pre-orders there. RLS keeps visitors out; only this server key gets in.

export const hasDb = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// db("orders?ref=eq.X", { method: "PATCH", body: {...} }) -> { ok, status, data, code }
export async function db(path, { method = "GET", body } = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: body && JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) console.error("supabase", method, path.split("?")[0], r.status, data?.code, data?.message);
  return { ok: r.ok, status: r.status, data, code: data?.code };
}

export const json = (data, status = 200) => Response.json(data, { status });

// Everything sellable in the dashboard's Inventory, for setLiveMenu(): [{ code, price, active }], or null
// if the database can't be reached. Supplies (beans, cups) are never on the menu.
export async function loadMenu() {
  if (!hasDb()) return null;
  const r = await db("products?select=code,selling_price,is_active&kind=neq.supply");
  return r.ok ? r.data.map((p) => ({ code: p.code, price: Number(p.selling_price), active: p.is_active })) : null;
}

// how long an unpaid booking holds its dates while the guest is on the payment page
export const HOLD_MINUTES = 30;
export const holdCutoff = () => new Date(Date.now() - HOLD_MINUTES * 60e3).toISOString();
