// Run with `npm run check`. Fails loudly if order pricing or validation breaks.
import assert from "node:assert/strict";
import { checkOrder, defaultChoices, describeLine, findItem, fmtTime, liveSlot, setLiveMenu, timeSlots } from "./order.js";

// 9:00 AM in Manila
const now = Date.parse("2026-11-02T01:00:00Z");

assert.deepEqual(describeLine({ itemId: "ramen", choices: ["Spicy", "Add cheese slice"] }).unit, 140);
assert.equal(describeLine({ itemId: "ramen", choices: ["Mild", "No cheese"] }).label, "Ramen (Mild)");
assert.equal(describeLine({ itemId: "signature-breakfast", choices: ["Juice"] }).unit, 345);
assert.equal(describeLine({ itemId: "coffee-latte", choices: [] }).unit, 130);
assert.equal(describeLine({ itemId: "ramen", choices: ["Spicy"] }), null); // missing a group
assert.equal(describeLine({ itemId: "ramen", choices: ["Hot", "No cheese"] }), null); // unknown choice
assert.equal(describeLine({ itemId: "nope" }), null);

const today = timeSlots(0, now);
assert.equal(today[0], "09:30"); // 9:00 + 20 min lead, next 15-min slot
assert.equal(today.at(-1), "19:45");
assert.equal(timeSlots(1, now)[0], "07:00");
assert.equal(fmtTime("13:05"), "1:05 PM");
assert.equal(fmtTime("00:30"), "12:30 AM");

const ok = {
  lines: [
    { itemId: "ramen", choices: ["Spicy", "Add cheese slice"], qty: 2 },
    { itemId: "coffee-latte", choices: [], qty: 1 },
  ],
  mode: "pickup", day: 0, time: "10:00", name: "Ana Cruz", email: "ana@x.ph", phone: "0917 123 4567",
};
const r = checkOrder(ok, now);
assert.equal(r.total, (140 * 2 + 130) * 100);
assert.equal(r.order.date, "2026-11-02");
assert.match(checkOrder({ ...ok, lines: [] }, now).error, /empty/);
assert.match(checkOrder({ ...ok, time: "09:00" }, now).error, /time/);
assert.match(checkOrder({ ...ok, lines: [{ itemId: "ramen", choices: ["Spicy", "No cheese"], qty: 0 }] }, now).error, /Up to/);
assert.match(checkOrder({ ...ok, lines: [{ itemId: "ramen", choices: [], qty: 1 }] }, now).error, /menu/);
assert.match(checkOrder({ ...ok, mode: "delivery" }, now).error, /pickup/);
// a price sent by the browser is ignored; the menu price is charged
assert.equal(checkOrder({ ...ok, lines: [{ itemId: "coffee-latte", choices: [], price: 1, qty: 1 }] }, now).total, 13000);
// the earliest slot picked 5 min ago is still accepted (grace), one from 30 min ago is not
assert.equal(checkOrder({ ...ok, time: "09:30" }, now + 5 * 60e3).error, undefined);
assert.match(checkOrder({ ...ok, time: "09:30" }, now + 30 * 60e3).error, /time/);
// stale picks roll forward: past slot -> next one; after closing -> same time tomorrow
assert.deepEqual([liveSlot(0, "09:30", now).time, liveSlot(0, "07:00", now).time], ["09:30", "09:30"]);
const late = Date.parse("2026-11-02T13:00:00Z"); // 9 PM Manila
assert.deepEqual([liveSlot(0, "19:45", late).day, liveSlot(0, "19:45", late).time], [1, "19:45"]);
// one plate item with a required ulam pick
assert.equal(describeLine({ itemId: "filipino-plate", choices: ["Tocino"] }).label, "Filipino Comfort Plate (Tocino)");
// Crispy Pata needs 45 min: 9:30 is too soon for it, 9:45 is fine (9:00 + 45)
const pata = { ...ok, lines: [{ itemId: "crispy-pata", choices: ["Group meal, good for 3 to 4"], qty: 1 }] };
assert.match(checkOrder({ ...pata, time: "09:30" }, now).error, /time/);
assert.equal(checkOrder({ ...pata, time: "09:45" }, now).total, 79900);
assert.equal(liveSlot(0, "09:30", now, 45).time, "09:45");
// POS codes: a choice can be its own product (ulam, group meal) or an add-on on top
assert.deepEqual(
  [describeLine({ itemId: "filipino-plate", choices: ["Tocino"] }).code, describeLine({ itemId: "ramen", choices: ["Spicy", "Add cheese slice"] }).extras],
  ["FP02", ["AD02"]]
);
// live Inventory prices win; inactive or missing products can't be ordered; defaults skip sold-out choices
setLiveMenu([
  { code: "CF04", price: 140, active: true },
  { code: "FP01", price: 195, active: false },
  { code: "FP02", price: 200, active: true },
  { code: "CC03", price: 120, active: true },
  { code: "AD02", price: 25, active: true },
]);
assert.equal(describeLine({ itemId: "coffee-latte", choices: [] }).unit, 140);
assert.equal(describeLine({ itemId: "filipino-plate", choices: ["Corned Beef"] }), null);
assert.deepEqual(defaultChoices(findItem("filipino-plate")), ["Tocino"]);
assert.equal(describeLine({ itemId: "ramen", choices: ["Spicy", "Add cheese slice"] }).unit, 145);
assert.equal(describeLine({ itemId: "coffee-espresso", choices: [] }), null); // not in Inventory
assert.equal(checkOrder({ ...ok, lines: [{ itemId: "coffee-latte", choices: [], qty: 2 }] }, now).total, 28000);
console.log("order checks passed");
