import { marketStats } from "@/components/landing/landing-copy";

const accent = "var(--nyx-accent)";

export function MarketStructureBand() {
  return (
    <section
      id="landing-content"
      className="relative isolate overflow-hidden border-t"
      style={{
        borderColor: "rgba(10,10,13,0.08)",
        background:
          "linear-gradient(135deg, rgb(250,250,249) 0%, rgb(255,255,255) 52%, oklch(0.62 0.14 260 / 0.10) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--nyx-accent), var(--nyx-signal-green), transparent)",
        }}
      />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-7">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="font-sans text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              Market structure reality
            </span>
            <h2
              className="mt-3 font-sans font-semibold leading-tight tracking-[-0.03em]"
              style={{ fontSize: "clamp(22px, 3.6vw, 42px)", color: "rgb(28,25,23)" }}
            >
              Dark liquidity is not a crypto novelty.
              <span className="block" style={{ color: "rgb(87,83,78)" }}>
                It is how serious markets already move size.
              </span>
            </h2>
          </div>
          <p className="max-w-sm font-sans text-[12px] leading-[1.8]" style={{ color: "rgb(87,83,78)" }}>
            In U.S. equities, FINRA publishes delayed transparency data for ATS and OTC trading.
            The headline lesson for crypto: sophisticated traders already demand private execution
            paths when public order flow leaks strategy.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 md:grid-cols-3">
          {marketStats.map((stat, index) => (
            <article
              key={stat.label}
              className="group relative min-h-[156px] overflow-hidden bg-white p-6"
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    index === 2
                      ? "radial-gradient(circle at 70% 20%, rgba(95,184,95,0.18), transparent 42%)"
                      : "radial-gradient(circle at 70% 20%, oklch(0.62 0.14 260 / 0.18), transparent 42%)",
                }}
              />
              <div className="relative">
                <div
                  className="font-sans font-semibold leading-none tracking-[-0.05em]"
                  style={{
                    fontSize: "clamp(34px, 5vw, 58px)",
                    color: index === 2 ? "var(--nyx-signal-green)" : accent,
                  }}
                >
                  {stat.value}
                </div>
                <p className="mt-4 max-w-[15rem] font-sans text-[13px] font-medium leading-snug text-stone-900">
                  {stat.label}
                </p>
                <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.16em] text-stone-500">
                  {stat.source}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
