import { useEffect, useRef, useState } from "react";
import { AddButton, CartDrawer, CartPill, ItemPicker } from "../components/Cart";
import { DRINKS, FOOD, HOURS } from "../data/menu";
import { useCart } from "../lib/cart";
import { fmtTime } from "../lib/order";

const CATEGORIES = [...FOOD, ...DRINKS];

const STEPS = ["Pick from the menu", "Pay online", "Pick up or dine in"];

// /order: the full menu with a cart. Tap a card for details, + to add; the bar at the bottom opens the cart.
export default function OrderPage() {
  const [picking, setPicking] = useState(null); // item whose details/options are open
  const [cartOpen, setCartOpen] = useState(false);
  const active = useActiveSection();

  // how many of each item are already in the cart, for the "2 in order" badges
  const inCart = {};
  for (const l of useCart()) inCart[l.itemId] = (inCart[l.itemId] ?? 0) + l.qty;

  return (
    <>
      <section className="px-4 pt-24 sm:px-8 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[0.3em] text-teal-deep uppercase">Menu &amp; order</p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-tight font-semibold">
            Order ahead, <span className="brush">skip the wait.</span>
          </h1>
          <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-tiffany text-xs font-bold text-espresso">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-espresso/70">
            Open {fmtTime(HOURS.open)} to {fmtTime(HOURS.close)}, today or tomorrow · GCash, Maya, card or QR Ph
          </p>
        </div>
      </section>

      <CategoryBar active={active} />

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-10 pb-32 sm:px-8">
        {CATEGORIES.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`} className="scroll-mt-32">
            <h2 id={`h-${c.id}`} className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-semibold">
              <span className="brush">{c.name}</span>
            </h2>
            {c.note && <p className="mt-2 text-espresso/70">{c.note}</p>}
            <ul className={`mt-6 grid gap-3 ${c.items.length > 1 ? "md:grid-cols-2" : "md:max-w-[calc(50%-0.375rem)]"} ${DRINKS.includes(c) ? "lg:grid-cols-3" : ""}`}>
              {c.items.map((it) => (
                <li key={it.id}>
                  <ItemCard item={it} count={inCart[it.id]} onPick={setPicking} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <CartPill onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ItemPicker item={picking} onClose={() => setPicking(null)} />
    </>
  );
}

// One menu item. The name is a button stretched over the card (details); + sits above it (quick add).
function ItemCard({ item, count, onPick }) {
  return (
    <article className="relative flex h-full gap-4 rounded-2xl bg-white/60 p-4 ring-1 ring-espresso/10 transition-shadow duration-150 has-[h3_button:hover]:ring-teal has-[h3_button:focus-visible]:ring-2 has-[h3_button:focus-visible]:ring-teal">
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-lg leading-snug font-semibold">
          <button type="button" onClick={() => onPick(item)} className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl">
            {item.name}
          </button>
        </h3>
        {item.desc && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-espresso/70">{item.desc}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
          <span className="font-bold text-teal-deep tabular-nums">₱{item.price}</span>
          {item.options && <span className="text-xs text-espresso/60">Options available</span>}
          {count > 0 && <span className="rounded-full bg-tiffany/60 px-2 py-0.5 text-xs font-bold text-espresso">{count} in order</span>}
        </div>
      </div>
      {item.img ? (
        <div className="pointer-events-none relative shrink-0 self-start">
          <img src={`/food/${item.img}.webp`} alt="" loading="lazy" className="size-24 rounded-xl object-cover sm:size-28" />
          <AddButton item={item} onPick={onPick} className="pointer-events-auto absolute -right-2 -bottom-2 z-10" />
        </div>
      ) : (
        <AddButton item={item} onPick={onPick} className="relative z-10 self-end" />
      )}
    </article>
  );
}

// Sticky chips for every category; the one you're reading is filled in and kept in view.
// Chip taps replace the URL hash instead of pushing history, so Back leaves the page, not the section.
function CategoryBar({ active }) {
  const bar = useRef(null);
  useEffect(() => {
    const chip = bar.current?.querySelector(`[href="#${active}"]`);
    if (chip) bar.current.scrollTo({ left: chip.offsetLeft - bar.current.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Menu categories" className="sticky top-16 z-30 mt-8 border-y border-espresso/10 bg-cream/90 backdrop-blur">
      <div ref={bar} className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-8">
        {CATEGORIES.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-current={active === c.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(c.id).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
              history.replaceState(null, "", `#${c.id}`);
            }}
            className={`shrink-0 rounded-full border border-teal-deep/30 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-teal-deep transition-colors duration-150 hover:bg-tiffany/40 aria-[current]:border-teal-deep aria-[current]:bg-teal-deep aria-[current]:text-cream ${i === FOOD.length ? "ml-3" : ""}`}
          >
            {c.short}
          </a>
        ))}
      </div>
    </nav>
  );
}

// id of the category section currently under the sticky bar
function useActiveSection() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-130px 0px -65% 0px" } // a band just below the header + chip bar
    );
    CATEGORIES.forEach((c) => io.observe(document.getElementById(c.id)));
    return () => io.disconnect();
  }, []);
  return active;
}
