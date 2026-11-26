import { MotionConfig } from "motion/react";
import { Mark, Wordmark } from "./components/Logo";
import PaymentResult from "./components/PaymentResult";
import { HOURS } from "./data/menu";
import { fmtTime } from "./lib/order";
import OrderPage from "./pages/OrderPage";

// For now the site is the ordering page only, at every path (/, /order, old links).
// The landing page, rooms and booking (pages/Home, pages/StayPage, components/BookingForm) are kept in
// the repo for when the B&B goes online; the old staff screen is replaced by the dashboard's order board.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-espresso/10 bg-cream/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <a href="/" aria-label="Wander, order online" className="h-8 shrink-0 text-teal-deep sm:h-10">
            <Wordmark tagline={false} className="h-full text-base" />
          </a>
          <p className="text-sm font-semibold whitespace-nowrap text-espresso/75">
            Open {fmtTime(HOURS.open)} to {fmtTime(HOURS.close)}
          </p>
        </nav>
      </header>
      <main>
        <OrderPage />
      </main>
      <Footer />
      <PaymentResult />
    </MotionConfig>
  );
}

function Footer() {
  return (
    <footer className="bg-espresso px-4 py-16 text-cream sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="h-24 text-tiffany">
          <Wordmark className="h-full text-2xl" />
        </div>
        <div className="space-y-4 text-sm text-cream/75 md:text-right">
          <p className="font-display text-lg text-cream">Good food. Slow moments. Better together.</p>
          <p className="tracking-[0.2em] uppercase">Made with care · Served with heart · Made for you</p>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl items-center gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50">
        <Mark className="size-5" title="" />© {new Date().getFullYear()} Wander Cafe + B&amp;B
      </div>
    </footer>
  );
}
