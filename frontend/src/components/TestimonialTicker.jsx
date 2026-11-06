import { initials } from "./ui";

// Illustrative feedback from fictional merchants — shown as
// streaming social proof on the landing page.
const reviews = [
  {
    quote:
      "Our settlement desk stopped chasing WhatsApp threads. " +
      "Everything lands in one queue now.",
    name: "Adaora N.",
    title: "Settlements Lead",
    company: "NairaFlow",
  },
  {
    quote:
      "Escalations finally arrive with context — we cut " +
      "mean-time-to-resolve by half.",
    name: "Tobi A.",
    title: "Head of Operations",
    company: "TorchBank",
  },
  {
    quote:
      "The SLA badges alone changed how our team prioritises.",
    name: "Chika E.",
    title: "Merchant Support",
    company: "Cobalt Express",
  },
  {
    quote:
      "Internal notes keep our risk team in the loop without " +
      "spooking customers.",
    name: "Yemi O.",
    title: "Compliance Officer",
    company: "BridgeNet Payments",
  },
  {
    quote:
      "We closed our first month with zero uncredited-transfer " +
      "tickets past SLA.",
    name: "Fatima S.",
    title: "Treasury Operations",
    company: "SwiftKart",
  },
];

const ReviewCard = ({ r }) => (
  <div
    className={
      "w-[300px] shrink-0 rounded-2xl border border-ink-100 " +
      "bg-white p-5 shadow-card sm:w-[340px]"
    }
  >
    <p className="text-sm leading-relaxed text-ink-700">
      “{r.quote}”
    </p>
    <div className="mt-4 flex items-center gap-3">
      <span
        className={
          "flex h-9 w-9 items-center justify-center rounded-full " +
          "bg-ink-900 text-xs font-bold text-acid-400"
        }
      >
        {initials(r.name)}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{r.name}</p>
        <p className="text-xs text-ink-400">
          {r.title} · <span className="font-medium text-ink-600">
            {r.company}
          </span>
        </p>
      </div>
    </div>
  </div>
);

const TestimonialTicker = () => (
  <section className="mx-auto max-w-7xl px-6 pb-20">
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
        What ops teams say
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink-950">
        Running desks are already on the clock.
      </h2>
      <p className="mt-2 text-sm text-ink-400">
        Illustrative feedback from fictional merchants in the
        DeskNG demo universe.
      </p>
    </div>

    <div className="marquee-mask marquee-hover mt-10 overflow-hidden">
      <div className="marquee-track gap-5 pr-5">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex gap-5"
            aria-hidden={copy === 1}
          >
            {reviews.map((r) => (
              <ReviewCard key={`${copy}-${r.company}`} r={r} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialTicker;
