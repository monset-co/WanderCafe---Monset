import { DRINKS, FOOD, HOURS } from "../data/menu.js";
import { addDays, todayPH } from "./booking.js";

// Shared by the cart (to show prices) and api/checkout.js (to charge them).
// A cart line is { itemId, choices: [label per option group], qty }.
// Prices and availability come from the dashboard's Inventory (products, by POS code) once
// setLiveMenu() has them; menu.js prices are the fallback until then. The server always loads them first.

const ITEMS = new Map([...FOOD, ...DRINKS].flatMap((c) => c.items.map((i) => [i.id, i])));
export const findItem = (id) => ITEMS.get(id);

export const MAX_QTY = 20;
const MAX_LINES = 30;

// ponytail: one module-level price list, replaced whole on each load (page fetch, or per checkout on the
// server). Pass it through as an argument if this ever runs requests that need different lists at once.
let live = null; // Map code -> { price, active }, or null = not loaded
export function setLiveMenu(rows) {
  live = new Map(rows.map((r) => [r.code, r]));
}
// a code is sellable if Inventory has it active; before anything loads, everything in menu.js is
const onMenu = (code) => !code || !live || live.get(code)?.active === true;
const priceOf = (code, fallback) => live?.get(code)?.price ?? fallback;

export const choiceOn = (c) => onMenu(c.code ?? c.extra);
// what a choice adds to the default: an add-on's own price, or the gap between products (ala carte -> group meal)
export const choicePrice = (item, c) =>
  c.extra ? priceOf(c.extra, c.price ?? 0) : c.code ? priceOf(c.code, item.price + (c.price ?? 0)) - priceOf(item.code, item.price) : 0;

export const lineKey = (itemId, choices) => [itemId, ...choices].join("|");
// first available choice per group (if Corned Beef is sold out, the plate opens on Tocino)
export const defaultChoices = (item) => (item.options ?? []).map((g) => (g.choices.find(choiceOn) ?? g.choices[0]).label);

// Price, receipt label and POS codes for one line, or null if it isn't on the menu (anymore).
// The line's product is the item's code, or a choice's own code; add-on choices add their codes as extras.
export function describeLine({ itemId, choices = [] }) {
  const item = ITEMS.get(itemId);
  const groups = item?.options ?? [];
  if (!item || choices.length !== groups.length) return null;
  let code = item.code;
  let base = item.price;
  const extras = [];
  const shown = [];
  for (const [i, g] of groups.entries()) {
    const c = g.choices.find((c) => c.label === choices[i]);
    if (!c) return null;
    if (c.code) [code, base] = [c.code, item.price + (c.price ?? 0)];
    else if (c.extra) extras.push(c);
    if (!c.label.startsWith("No ")) shown.push(c.label);
  }
  if (!onMenu(code) || !extras.every(choiceOn)) return null;
  const unit = priceOf(code, base) + extras.reduce((sum, c) => sum + priceOf(c.extra, c.price ?? 0), 0);
  return {
    item, code, unit,
    extras: extras.map((c) => c.extra),
    choices,
    label: shown.length ? `${item.name} (${shown.join(", ")})` : item.name,
  };
}

// an item is shown if it can be ordered with its default choices; its card price is that line's price
export const itemLine = (item) => describeLine({ itemId: item.id, choices: defaultChoices(item) });

// Kitchen time the order needs: the usual lead, or longer if something is cooked to order (Crispy Pata).
// Takes cart lines ({ itemId }) or described lines ({ item }).
export const leadFor = (lines) =>
  Math.max(HOURS.leadMinutes, ...lines.map((l) => (l.item ?? ITEMS.get(l.itemId))?.leadMinutes ?? 0));

// minutes past midnight in Manila
const minutesPH = (now) => {
  const d = new Date(now + 8 * 36e5);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};
const toMin = (hhmm) => +hhmm.slice(0, 2) * 60 + +hhmm.slice(3);
const toHHMM = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// Pickup / dine-in times for today (day 0) or tomorrow (day 1), every 15 min while open,
// at least `leadMinutes` from now so the kitchen has time.
export function timeSlots(day, now = Date.now(), lead = HOURS.leadMinutes) {
  const earliest = day === 0 ? minutesPH(now) + lead : 0;
  const out = [];
  for (let m = toMin(HOURS.open); m <= toMin(HOURS.close) - HOURS.stepMinutes; m += HOURS.stepMinutes)
    if (m >= earliest) out.push(toHHMM(m));
  return out;
}

// The day/time to actually use: the guest's pick while it's still offered, else the next open slot
// (tomorrow once today's last slot has passed). Keeps a cart left open for a while from going stale.
export function liveSlot(day, time, now = Date.now(), lead = HOURS.leadMinutes) {
  if (day === 0 && !timeSlots(0, now, lead).length) day = 1;
  const slots = timeSlots(day, now, lead);
  return { day, time: slots.includes(time) ? time : slots[0], slots };
}

// a slot picked while filling in the form stays valid this much longer, so a guest who picked
// the earliest time isn't bounced for typing slowly (the kitchen still gets lead - grace minutes)
const GRACE_MS = 10 * 60e3;

export const fmtTime = (hhmm) => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60) % 12 || 12;
  return `${h}:${String(m % 60).padStart(2, "0")} ${m < 720 ? "AM" : "PM"}`;
};

// Validates an order request. Returns { error } or { lines, order, total } (total in centavos).
export function checkOrder(input, now = Date.now()) {
  const o = input ?? {};
  if (!Array.isArray(o.lines) || o.lines.length === 0) return { error: "Your order is empty." };
  if (o.lines.length > MAX_LINES) return { error: "That's a big order! Please message us for catering." };

  const lines = [];
  for (const l of o.lines) {
    const d = describeLine({ itemId: l?.itemId, choices: Array.isArray(l?.choices) ? l.choices : [] });
    if (!d) return { error: "Part of your order isn't on the menu anymore. Please remove it and try again." };
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY) return { error: `Up to ${MAX_QTY} of each item.` };
    lines.push({ ...d, qty: l.qty });
  }

  if (o.mode !== "pickup" && o.mode !== "dine-in") return { error: "Choose pickup or dine-in." };
  if (o.day !== 0 && o.day !== 1) return { error: "Choose today or tomorrow." };
  if (!timeSlots(o.day, now - GRACE_MS, leadFor(lines)).includes(o.time)) return { error: "That time isn't available anymore. Please pick another." };

  const name = String(o.name ?? "").trim();
  const email = String(o.email ?? "").trim();
  const phone = String(o.phone ?? "").trim();
  const notes = String(o.notes ?? "").trim();
  if (name.length < 2 || name.length > 80) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { error: "Please enter a valid email." };
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return { error: "Please enter a valid mobile number." };
  if (notes.length > 200) return { error: "Keep notes under 200 characters." };

  const total = lines.reduce((sum, l) => sum + l.unit * l.qty, 0) * 100;
  const date = addDays(todayPH(now), o.day);
  return { lines, order: { mode: o.mode, date, time: o.time, name, email, phone, notes }, total };
}
