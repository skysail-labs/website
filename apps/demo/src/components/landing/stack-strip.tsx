import { stack } from "@/components/landing/landing-copy";

const accent = "var(--nyx-accent)";

export function StackStrip() {
  return (
    <section
      className="border-t py-12"
      style={{ borderColor: "rgba(10,10,13,0.08)", background: "rgb(250,250,249)" }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span
            className="font-sans text-[10px] uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {stack.eyebrow}
          </span>
        </div>
        <p
          className="mt-3 max-w-xl font-sans text-[11px] leading-[1.75]"
          style={{ color: "rgb(87,83,78)" }}
        >
          {stack.body}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          {stack.items.map((s) => (
            <li
              key={s.label}
              className="flex flex-col gap-0.5 border-l border-stone-200 pl-3 transition-colors hover:border-[var(--nyx-accent)]/50"
            >
              <span
                className="font-sans text-[12px] font-medium"
                style={{ color: "rgb(28,25,23)" }}
              >
                {s.label}
              </span>
              <span
                className="font-sans text-[10px] leading-snug"
                style={{ color: "rgb(87,83,78)" }}
              >
                {s.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
