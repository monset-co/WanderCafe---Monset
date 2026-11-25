import { useEffect, useRef, useState } from "react";
import { addToCart, cartSummary, setQty, useCart } from "../lib/cart";
import { peso } from "../lib/booking";
import { checkOrder, defaultChoices, describeLine, fmtTime, leadFor, liveSlot, MAX_QTY, timeSlots } from "../lib/order";
import { HOURS } from "../data/menu";
import PayButton, { field, label, startCheckout, useSending } from "./PayButton";
import { Plane } from "./Logo";

// ---- adding things --------------------------------------------------------------------------

// "+" on a menu card. Items with options open the picker; plain items go straight in.
export function AddButton({ item, onPick, className = "" }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        if (item.options) return onPick(item);
        addToCart(item.id, []);
        flyToCart(e.currentTarget);
      }}
      aria-label={item.options ? `Choose options for ${item.name}` : `Add ${item.name} to order`}
      className={`grid size-10 shrink-0 place-items-center rounded-full bg-teal-deep text-2xl leading-none text-cream shadow-md transition-transform duration-150 ease-out hover:scale-105 active:scale-95 ${className}`}
    >
      +
    </button>
  );
}

// Close a native <dialog> when its backdrop (the dialog element itself, outside the panel) is clicked
const backdropClose = (e) => e.target === e.currentTarget && e.currentTarget.close();

// Item details: photo, options and quantity, then add. A native <dialog>: Esc, focus and the backdrop come free.
export function ItemPicker({ item, onClose }) {
  const ref = useRef(null);
  const [choices, setChoices] = useState([]);
  const [qty, setQ] = useState(1);

  useEffect(() => {
    if (!item) return;
    setChoices(defaultChoices(item));
    setQ(1);
    ref.current.showModal();
  }, [item]);

  const groups = item?.options ?? [];
  const line = item && choices.length === groups.length ? describeLine({ itemId: item.id, choices }) : null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={backdropClose}
      aria-label={item?.name}
      className="pop m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100%-2rem))] overflow-y-auto rounded-[2rem] bg-cream p-0 text-espresso shadow-2xl backdrop:bg-espresso/40"
    >
      {item && (
        <form
          method="dialog"
          onSubmit={() => {
            if (!line) return;
            addToCart(item.id, choices, qty);
            // fly from the dialog's button once the dialog has closed
            const from = ref.current.querySelector("[data-add]").getBoundingClientRect();
            requestAnimationFrame(() => flyToCart(from));
          }}
        >
          {item.img && <img src={`/food/${item.img}.webp`} alt="" className="aspect-[16/10] w-full object-cover" />}
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 pr-8">
              <h2 className="font-display text-2xl leading-tight font-semibold">{item.name}</h2>
              <span className="font-display text-xl font-semibold text-teal-deep tabular-nums">₱{item.price}</span>
            </div>
            {item.desc && <p className="mt-2 text-sm leading-relaxed text-espresso/75">{item.desc}</p>}
            {groups.map((g, gi) => (
              <fieldset key={g.name} className="mt-5">
                <legend className={label}>{g.name}</legend>
                <div className="flex flex-wrap gap-2">
                  {g.choices.map((c) => (
                    <label
                      key={c.label}
                      className="cursor-pointer rounded-full border-2 border-espresso/15 px-4 py-2 text-sm font-semibold transition-colors duration-150 hover:border-teal has-checked:border-teal-deep has-checked:bg-teal-deep has-checked:text-cream has-focus-visible:ring-2 has-focus-visible:ring-teal"
                    >
                      <input
                        type="radio"
                        name={g.name}
                        className="sr-only"
                        checked={choices[gi] === c.label}
                        onChange={() => setChoices((cs) => cs.map((x, i) => (i === gi ? c.label : x)))}
                      />
                      {c.label}
                      {c.price ? <span className="opacity-75"> +₱{c.price}</span> : null}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="mt-7 flex items-center gap-4">
              <Stepper value={qty} onChange={setQ} name={item.name} min={1} />
              <button
                data-add
                className="flex-1 rounded-full bg-teal-deep px-5 py-3.5 font-bold text-cream transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                Add to order · <span className="tabular-nums">{line ? peso(line.unit * qty * 100) : ""}</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => ref.current.close()}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-cream/90 text-2xl leading-none text-espresso/70 shadow hover:text-espresso"
          >
            ×
          </button>
        </form>
      )}
    </dialog>
  );
}

// − n +. With min 0 (the cart), the − at 1 becomes a bin so it's clear it removes the line.
function Stepper({ value, onChange, name, min = 0 }) {
  const btn = "grid size-9 place-items-center rounded-full border-2 border-espresso/15 text-lg leading-none transition-colors duration-150 hover:border-teal disabled:opacity-40";
  const removes = min === 0 && value === 1;
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={removes ? `Remove ${name}` : `One less ${name}`}>
        {removes ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="size-4">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        ) : (
          "−"
        )}
      </button>
      <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={`One more ${name}`}>+</button>
    </div>
  );
}

// A little paper plane flies from what you tapped to the cart pill, then the pill gives a nod.
// Native Web Animations along a sampled curve; skipped for reduced motion.
export function flyToCart(from) {
  const to = document.getElementById("cart-pill");
  if (!to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect ? from.getBoundingClientRect() : from;
  const b = to.getBoundingClientRect();
  const p0 = [a.left + a.width / 2, a.top + a.height / 2];
  const p2 = [b.left + b.width / 2, b.top + b.height / 2];
  const p1 = [(p0[0] + p2[0]) / 2 + 80, Math.min(p0[1], p2[1]) - 140]; // arc up and over
  const at = (t, i) => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i];
  const dir = (t, i) => 2 * (1 - t) * (p1[i] - p0[i]) + 2 * t * (p2[i] - p1[i]);

  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:0;top:0;width:28px;height:24px;margin:-12px 0 0 -14px;z-index:70;pointer-events:none;color:var(--color-teal)";
  el.innerHTML = '<svg viewBox="-22 -10 24 20" fill="currentColor" width="28" height="24"><path d="M0 0L-20-8-13 1Z"/><path d="M0 0-13 1-16 9Z" opacity=".55"/></svg>';
  document.body.append(el);

  const frames = Array.from({ length: 13 }, (_, k) => {
    const t = k / 12;
    const angle = (Math.atan2(dir(t, 1), dir(t, 0)) * 180) / Math.PI;
    return {
      transform: `translate(${at(t, 0)}px, ${at(t, 1)}px) rotate(${angle}deg) scale(${1 - 0.4 * t})`,
      opacity: t === 0 ? 0 : t === 1 ? 0 : 1,
    };
  });
  el.animate(frames, { duration: 750, easing: "cubic-bezier(0.45, 0, 0.25, 1)" }).finished.then(() => {
    el.remove();
    to.animate([{ scale: 1 }, { scale: 1.08 }, { scale: 1 }], { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  });
}

// ---- the cart ---------------------------------------------------------------------------------

// Floating bar at the bottom of /order; opens the drawer. Hidden while the cart is empty.
export function CartPill({ onOpen }) {
  const lines = useCart();
  const { total, count } = cartSummary(lines);
  return (
    <button
      id="cart-pill"
      type="button"
      onClick={onOpen}
      tabIndex={count ? 0 : -1}
      aria-hidden={!count}
      aria-label={`View order: ${count} item${count === 1 ? "" : "s"}, ${peso(total)}`}
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-full bg-espresso py-3 pr-3 pl-5 text-cream shadow-2xl transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${count ? "" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <span className="grid size-7 place-items-center rounded-full bg-tiffany text-sm font-bold text-espresso tabular-nums">{count}</span>
      <span className="flex-1 text-left font-semibold">View order</span>
      <span className="rounded-full bg-cream px-4 py-1.5 font-bold text-espresso tabular-nums">{peso(total)}</span>
    </button>
  );
}

const Step = ({ n, children }) => (
  <h3 className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold">
    <span className="grid size-6 place-items-center rounded-full bg-teal-deep font-sans text-xs font-bold text-cream">{n}</span>
    {children}
  </h3>
);

// Right-hand sheet in three steps: your items, when, your details. Then pay.
export function CartDrawer({ open, onClose }) {
  const ref = useRef(null);
  const lines = useCart();
  const { total, count } = cartSummary(lines);

  const [form, setForm] = useState({ mode: "pickup", day: 0, time: "", name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useSending();
  const set = (patch) => (setError(""), setForm((f) => ({ ...f, ...patch })));

  // the guest's pick, rolled forward if it has passed while the page sat open
  // (later when something cooked to order, like Crispy Pata, is in the cart)
  const lead = leadFor(lines);
  const slot = liveSlot(form.day, form.time, Date.now(), lead);
  const todayOpen = timeSlots(0, Date.now(), lead).length > 0;
  const slow = lines.map((l) => describeLine(l).item).find((i) => i.leadMinutes);

  useEffect(() => {
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    // the browser's own checks first (required, email, phone pattern): it points at the field
    if (!e.currentTarget.reportValidity()) return;
    const payload = { type: "order", lines: lines.map(({ itemId, choices, qty }) => ({ itemId, choices, qty })), ...form, day: slot.day, time: slot.time };
    const check = checkOrder(payload); // same rules the server uses
    if (check.error) return setError(check.error);
    setSending(true);
    try {
      await startCheckout(payload);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  const when = slot.time && `${slot.day === 0 ? "today" : "tomorrow"} at ${fmtTime(slot.time)}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={backdropClose}
      aria-label="Your order"
      className="sheet m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-cream p-0 text-espresso shadow-2xl backdrop:bg-espresso/40"
    >
      <form onSubmit={submit} className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-espresso/10 bg-cream px-6 py-4">
          <h2 className="font-display text-2xl font-semibold">Your order</h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="grid size-9 place-items-center rounded-full text-2xl leading-none text-espresso/60 hover:bg-espresso/5 hover:text-espresso">×</button>
        </header>

        {!count ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <svg viewBox="-22 -10 24 20" aria-hidden="true" fill="currentColor" className="size-10 text-tiffany"><Plane /></svg>
            <p className="font-display text-xl font-semibold">Your order is empty</p>
            <p className="text-sm text-espresso/70">Tap + on anything on the menu to add it here.</p>
            <button type="button" onClick={onClose} className="rounded-full bg-teal-deep px-6 py-3 font-bold text-cream">Browse the menu</button>
          </div>
        ) : (
          <>
            <section className="px-6 pt-6">
              <Step n={1}>Your items</Step>
              <ul className="divide-y divide-dashed divide-espresso/20">
                {lines.map((l) => {
                  const d = describeLine(l);
                  return (
                    <li key={l.key} className="flex items-center gap-3 py-3">
                      {d.item.img ? (
                        <img src={`/food/${d.item.img}.webp`} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-semibold">{d.label}</p>
                        <p className="text-sm text-espresso/60 tabular-nums">{peso(d.unit * 100)} each</p>
                      </div>
                      <Stepper value={l.qty} onChange={(q) => setQty(l.key, q)} name={d.item.name} />
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={onClose} className="mt-1 text-sm font-bold text-teal-deep underline-offset-4 hover:underline">
                + Add more items
              </button>
            </section>

            <section className="mt-6 border-t border-espresso/10 px-6 pt-6">
              <Step n={2}>When</Step>
              <div role="group" aria-label="Pickup or dine-in" className="grid grid-cols-2 gap-1 rounded-full bg-espresso/5 p-1">
                {[["pickup", "Pickup"], ["dine-in", "Dine-in"]].map(([v, t]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={form.mode === v}
                    onClick={() => set({ mode: v })}
                    className="rounded-full py-2 text-sm font-bold transition-colors duration-150 aria-pressed:bg-teal-deep aria-pressed:text-cream"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="day" className={label}>Day</label>
                  <select id="day" className={field} value={slot.day} onChange={(e) => set({ day: Number(e.target.value) })}>
                    {todayOpen && <option value={0}>Today</option>}
                    <option value={1}>Tomorrow</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="time" className={label}>{form.mode === "pickup" ? "Ready at" : "Table at"}</label>
                  <select id="time" className={field} value={slot.time} onChange={(e) => set({ time: e.target.value })}>
                    {slot.slots.map((s) => <option key={s} value={s}>{fmtTime(s)}</option>)}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-espresso/70">
                {form.mode === "pickup" ? "We'll have it packed and waiting " : "Your food will be on the table "}
                <strong className="text-espresso">{when}</strong>.
                {slow && ` ${slow.name} is cooked to order (up to ${lead} min), so earlier times aren't offered.`}
                {!todayOpen && ` We take orders for ${fmtTime(HOURS.open)} to ${fmtTime(HOURS.close)}.`}
              </p>
            </section>

            <section className="mt-6 space-y-4 border-t border-espresso/10 px-6 py-6">
              <Step n={3}>Your details</Step>
              <div>
                <label htmlFor="o-name" className={label}>Name</label>
                <input id="o-name" autoComplete="name" className={field} value={form.name} onChange={(e) => set({ name: e.target.value })} required minLength={2} maxLength={80} />
              </div>
              <div>
                <label htmlFor="o-phone" className={label}>Mobile</label>
                <input
                  id="o-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" className={field}
                  value={form.phone} onChange={(e) => set({ phone: e.target.value })}
                  required pattern="[+0-9][0-9 \-]{6,18}" title="A mobile number, like 0917 123 4567"
                />
              </div>
              <div>
                <label htmlFor="o-email" className={label}>Email <span className="font-normal tracking-normal normal-case">(for your receipt)</span></label>
                <input id="o-email" type="email" autoComplete="email" className={field} value={form.email} onChange={(e) => set({ email: e.target.value })} required maxLength={120} />
              </div>
              <div>
                <label htmlFor="o-notes" className={label}>Notes (optional)</label>
                <textarea id="o-notes" rows={2} maxLength={200} placeholder="Less ice, no onions…" className={`${field} resize-none`} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
              </div>
            </section>

            <footer className="sticky bottom-0 mt-auto border-t border-espresso/10 bg-cream px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="mb-2 flex justify-between text-lg font-bold text-teal-deep">
                <span>Total · {count} item{count === 1 ? "" : "s"}</span>
                <span className="tabular-nums">{peso(total)}</span>
              </div>
              <p role="alert" className="mb-2 min-h-5 text-sm font-semibold text-[#a3402a]">{error}</p>
              <PayButton sending={sending}>Pay {peso(total)}</PayButton>
            </footer>
          </>
        )}
      </form>
    </dialog>
  );
}
