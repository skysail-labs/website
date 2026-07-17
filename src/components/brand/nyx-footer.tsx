import { NyxLockup } from "./nyx-mark";
import Link from "next/link";

export function NyxFooter({ tone = "ink" }: { tone?: "ink" | "chalk" }) {
  const isInk = tone === "ink";
  return (
    <footer
      className={
        isInk
          ? "border-t border-white/[0.06] bg-nyx-ink py-4 text-nyx-fog"
          : "border-t border-black/[0.06] bg-nyx-chalk py-4 text-nyx-slate"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:px-7 md:flex-row md:items-end md:justify-between">
        <NyxLockup size={28} tone={isInk ? "chalk" : "ink"} />

        <div className="gateway-cta">
          <Link href="/docs" className="btn gateway-btn">
            EXPLORE THE DOCS <span className="arr">→</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
          {/* <a
            className="hover:text-nyx-accent"
            href="https://github.com/skysail-labs/darknyx"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a> */}
          <a
            className="hover:text-nyx-accent"
            href="https://x.com/DarkNyxProtocol"
            target="_blank"
            rel="noreferrer"
          >
            X
          </a>
        </div>

      </div>
    </footer>
  );
}
