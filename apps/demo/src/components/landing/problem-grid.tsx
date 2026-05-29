import { hardProblem, institutionalBenefits } from "@/components/landing/landing-copy";

const accent = "var(--nyx-accent)";

export function InstitutionalBenefits() {
  return (
    <section
      className="relative isolate border-t"
      style={{ borderColor: "rgba(10,10,13,0.08)", background: "rgb(255,255,255)" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-7 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              {institutionalBenefits.eyebrow}
            </span>
            <h2
              className="mt-3 font-sans font-semibold leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(20px, 2.8vw, 34px)", color: "rgb(28,25,23)" }}
            >
              {institutionalBenefits.title}
            </h2>
            <p className="mt-4 max-w-md font-sans text-[12px] leading-[1.85] text-stone-600">
              {institutionalBenefits.lede}
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-2">
            {institutionalBenefits.cards.map((card, index) => (
              <article key={card.title} className="group bg-stone-50 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    0{index + 1}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-[1.8]"
                    style={{ background: index % 2 ? "var(--nyx-signal-green)" : accent }}
                  />
                </div>
                <h3 className="mt-5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-stone-950">
                  {card.title}
                </h3>
                <p className="mt-3 font-sans text-[12px] leading-[1.75] text-stone-600">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HardProblemGrid() {
  return (
    <section
      className="relative isolate overflow-hidden border-t bg-stone-950"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 24%, oklch(0.62 0.14 260 / 0.28), transparent 28%), radial-gradient(circle at 84% 70%, rgba(95,184,95,0.18), transparent 30%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-7 sm:py-20">
        <div className="max-w-2xl">
          <span className="font-sans text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
            {hardProblem.eyebrow}
          </span>
          <h2
            className="mt-3 font-sans font-semibold leading-tight tracking-[-0.03em] text-stone-50"
            style={{ fontSize: "clamp(24px, 3.8vw, 44px)" }}
          >
            {hardProblem.title}
          </h2>
          <p className="mt-4 max-w-xl font-sans text-[13px] leading-[1.8] text-stone-300">
            {hardProblem.lede}
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {hardProblem.points.map((point, index) => (
            <article
              key={point.title}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
            >
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-xl"
                style={{ background: index % 2 ? "var(--nyx-signal-green)" : accent }}
              />
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Constraint 0{index + 1}
              </span>
              <h3 className="mt-5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-stone-50">
                {point.title}
              </h3>
              <p className="mt-3 font-sans text-[12px] leading-[1.75] text-stone-300">
                {point.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
