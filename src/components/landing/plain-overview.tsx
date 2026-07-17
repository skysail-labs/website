import { plainBand } from "@/components/landing/landing-copy";

const accent = "var(--nyx-accent)";

export function PlainOverview() {
  return (
    <section
      className="relative isolate overflow-hidden border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#08090f" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 0% 0%, oklch(0.62 0.14 260 / 0.22), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-7 sm:py-16">
        <div className="max-w-2xl">
          <span
            className="font-sans text-[10px] uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {plainBand.eyebrow}
          </span>
          <h2
            className="mt-3 font-sans font-semibold leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(18px, 2.2vw, 26px)" }}
          >
            <span style={{ color: "var(--nyx-chalk)" }}>{plainBand.title}</span>
          </h2>
          <p
            className="mt-4 max-w-xl font-sans text-[12px] leading-[1.85]"
            style={{ color: "rgba(245,243,238,0.72)" }}
          >
            {plainBand.lede}
          </p>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 sm:grid-cols-3" style={{ background: "rgba(255,255,255,0.1)" }}>
          {plainBand.points.map((point, i) => (
            <li
              key={point.title}
              className="nyx-rise bg-white/[0.04] p-7 sm:p-8"
              style={{ animationDelay: `${80 + i * 80}ms` }}
            >
              <div
                className="font-sans text-[9px] uppercase tracking-[0.2em]"
                style={{ color: accent, opacity: 0.85 }}
              >
                0{i + 1}
              </div>
              <h3
                className="mt-4 font-sans text-[14px] font-semibold leading-snug tracking-[-0.02em]"
                style={{ color: "var(--nyx-chalk)" }}
              >
                {point.title}
              </h3>
              <p
                className="mt-3 font-sans text-[12px] leading-[1.8]"
                style={{ color: "rgba(245,243,238,0.68)" }}
              >
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
