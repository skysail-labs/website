/**
 * Darknyx landing copy — single source of truth.
 *
 * Everything the page says lives here so that wording can be revised without
 * touching layout. Section order mirrors the narrative arc:
 * conviction → market gap → solution → technical credibility → thesis → contact.
 */

/* ---------------------------------------------------------------------------
 * Contact
 *
 * TODO(darknyx): swap `email` for the real inbound address once it exists.
 * Until then the primary CTA resolves to `primaryHref` (the X profile), which
 * is known-good. Set `email` and the CTA switches to mailto automatically.
 * ------------------------------------------------------------------------- */
export const CONTACT = {
  email: "" as string,
  x: "https://x.com/DarkNyxProtocol",
  docs: "https://docs.darknyx.trade",
} as const;

export const contactHref = CONTACT.email
  ? `mailto:${CONTACT.email}?subject=${encodeURIComponent("Darknyx introduction")}`
  : CONTACT.x;

/**
 * The interactive product demo, served as a static bundle from `public/demo/`.
 *
 * Everything it shows other than the price chart is a local simulation, and it
 * says so on every screen. The label is "Demo" so the nav never implies live
 * trading. `scenario=funded` seeds the walkthrough with balances so a first
 * visitor sees a populated venue instead of an empty one.
 */
export const DEMO = {
  href: "/demo?scenario=funded",
  label: "Demo",
} as const;

export const NAV_LINKS = [
  { label: "The gap", href: "#market" },
  { label: "Who it's for", href: "#counterparties" },
  { label: "Protocol", href: "#protocol" },
  { label: "Architecture", href: "#architecture" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * The whitepaper is not published yet, so the CTA falls back to the docs.
 * TODO(darknyx): point this at the real whitepaper URL once it exists.
 */
export const whitepaperHref = CONTACT.docs;

export const HERO = {
  headline: "Private execution for Solana markets",
  body: "Darknyx is a non-custodial venue where large orders meet privately. Matching runs inside an attested enclave; settlement is constrained by proofs on Solana.",
  primaryCta: "Talk to the team",
  secondaryCta: "Explore the protocol",
} as const;

export const MARKET_GAP = {
  label: "The gap",
  title: "Solana solved retail execution. Size is still unsolved.",
  intro:
    "Proprietary market makers rebuilt Solana's spot market in eighteen months. On ordinary swaps they now quote inside a few basis points and match centralised execution.",
  intro2:
    "Above that, execution degrades, and the reason is balance sheet rather than technology. A venue can only fill what it is willing to hold. There is no neutral place on Solana where two parties with real size can meet each other directly.",
  stats: [
    {
      value: "40–50%",
      body: "of Solana weekly DEX volume now clears through proprietary market makers, and over 80% of SOL-to-stablecoin flow.",
    },
    {
      value: "1–5 bps",
      body: "typical quoted spread on SOL for retail-sized trades. On-chain execution is genuinely competitive at the small end.",
    },
    {
      value: "$100k",
      body: "is roughly where that quality begins to fall away. The remaining gap reflects balance-sheet scale, not microstructure.",
    },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * Who it's for
 *
 * The venue only works when both sides of a block show up, so the section is
 * built as two counterparties facing each other across a spine rather than as
 * a single audience pitch. Side A brings a position to put on; side B has one
 * to take off.
 * ------------------------------------------------------------------------- */
export const COUNTERPARTIES = {
  label: "Who it's for",
  title: "Two counterparties, one venue.",
  intro:
    "One side has a position to put on. The other has one to take off. Neither can act publicly without announcing it. Darknyx crosses them at a fair reference price.",
  sides: [
    {
      side: "a",
      tag: "Funds, desks and large traders",
      heading: "Execute the position, not the announcement.",
      body: "Public liquidity reveals direction and urgency long before your order is finished.",
      points: [
        "Order intent never reaches a public book or mempool",
        "No price impact — fills clear at a reference price, not along a curve",
        "Signal interest in a block without revealing that you have one",
      ],
    },
    {
      side: "b",
      tag: "Market makers",
      heading: "Get flat without telling the market you need to.",
      body: "Unwinding inventory in public costs spread and shows your hand.",
      points: [
        "Cross at the reference price, so neither side pays a spread",
        "Rest interest privately, with no signal to competing quotes",
        "Clear positions larger than your book wants to carry",
      ],
    },
  ],
} as const;

export const SOLUTION = {
  label: "The protocol",
  title: "Private execution. Verifiable settlement.",
  intro:
    "Confidentiality that rests on a promise is not confidentiality. Each property below is enforced by something you can check yourself — an attestation, a proof, or a published parameter.",
  /* Each pillar names its enforcement in `check`: the thing a trader can verify
   * for themselves, so the property is not taken on trust. */
  pillars: [
    {
      icon: "flow",
      kicker: "Execution",
      heading: "Matching runs inside a sealed enclave.",
      body: "Order intent is encrypted directly to a confidential VM on attested hardware. Side, size and limit never enter a public book or an L1 transaction.",
      check: "Remote attestation over the enclave measurement, before any order leaves your client.",
    },
    {
      icon: "vault",
      kicker: "Settlement",
      heading: "Value moves only against a proof.",
      body: "Balances are commitments, not readable accounts. Every settlement carries a zero-knowledge proof of conservation, ownership and correct state transition. A compromised operator cannot mint, and cannot spend what isn't theirs.",
      check: "The on-chain verifier, which rejects any settlement that fails to prove, including ours.",
    },
    {
      icon: "veil",
      kicker: "Pricing",
      heading: "Fills are confined to a reference band.",
      body: "The venue cannot invent a price. Fills must land within a published band around an external reference, so we have no ability to fill you where the market wasn't.",
      check: "Band width and reference source are public parameters, changed only through governance.",
    },
    {
      icon: "match",
      kicker: "Timing",
      heading: "Orders clear in batches at a single price.",
      body: "A uniform-price auction on a randomised cadence. There is no queue position to win and no latency edge to buy, which makes resting interest here safer than resting it in public.",
      check: "One clearing price per batch, reported with the reference at the moment of the cross.",
    },
  ],
  /* The execution pipeline.
   *
   * Each stage carries three registers: the plain-language `label` a reader
   * skims, the `note` that says what it means, and the `detail` + `spec` pair
   * that a technical reader opens to check the work. Every stage's spec names
   * where it physically executes, which is the whole argument of the section —
   * intent stays client-side, matching stays in the enclave, only proofs and
   * commitments ever reach the chain. */
  flowLabel: "Execution pipeline",
  flow: [
    {
      step: "01",
      label: "Order intent",
      note: "Order intent never touches a public book.",
      detail:
        "The client builds a Poseidon commitment over the order and the note backing it, then submits it directly to the enclave. Side, size, limit and note remain on the trader's machine. Nothing about the order is broadcast, and nothing enters a public mempool or order book.",
      spec: [
        { k: "Commitment", v: "Poseidon" },
        { k: "Executes on", v: "Client" },
        { k: "Public data", v: "None" },
      ],
    },
    {
      step: "02",
      label: "TDX enclave match",
      note: "Uniform clearing price inside the enclave.",
      detail:
        "Inside an attested Intel TDX confidential VM, private bids and asks clear as a batch at a single uniform price, subject to market controls and an external TWAP circuit breaker. The operator cannot observe or reorder the book, and clients can verify the enclave measurement before they ever submit.",
      spec: [
        { k: "Mechanism", v: "Uniform-price batch" },
        { k: "Executes on", v: "Attested TDX VM" },
        { k: "Public data", v: "None" },
      ],
    },
    {
      step: "03",
      label: "ZK proof generation",
      note: "Groth16 constrains every transition.",
      detail:
        "The enclave produces a Groth16 validity proof over the batch. The proof constrains conservation of value, correct output-note construction, fee application and market binding — so a settlement that does not follow the rules cannot be authorised, whatever the operator intends.",
      spec: [
        { k: "System", v: "Groth16 / BN254" },
        { k: "Constrains", v: "Value, notes, fees" },
        { k: "Public data", v: "Proof only" },
      ],
    },
    {
      step: "04",
      label: "Solana settlement",
      note: "Amounts and prices stay hidden.",
      detail:
        "Solana verifies the proof and atomically updates the vault and the note commitment tree. Replay-protection accounts prevent a batch being used twice. What lands on-chain is a verified state transition — the trade amounts and execution prices are never part of it.",
      spec: [
        { k: "Update", v: "Atomic vault write" },
        { k: "Replay guard", v: "Nullifier accounts" },
        { k: "Data leaked", v: "0%" },
      ],
    },
  ],
} as const;

export const ARCHITECTURE = {
  label: "Architecture",
  title: "Built for confidential execution, not cosmetic privacy.",
  intro:
    "Darknyx combines trusted hardware, zero-knowledge proofs and private note-based custody so that sensitive execution data remains confidential without giving the operator arbitrary control over user funds.",
  layers: [
    {
      tier: "Layer 01",
      name: "Confidential execution",
      label: "Intel TDX on Phala Cloud",
      body: "Matching, proving and settlement orchestration run inside an attested confidential VM. Clients can verify the enclave before submitting order intent.",
      cta: "Read the TEE architecture",
      href: "/docs",
    },
    {
      tier: "Layer 02",
      name: "Cryptographic settlement",
      label: "Groth16 over BN254",
      body: "Batched proofs constrain private balance transitions, conservation, output-note construction, fees and market binding before settlement is authorised.",
      cta: "Explore the cryptography",
      href: "/docs",
    },
    {
      tier: "Layer 03",
      name: "Private custody",
      label: "Encrypted UTXO notes on Solana",
      body: "User balances are represented as Poseidon commitments inside a sharded incremental Merkle tree. Amounts, ownership data and trade details remain hidden.",
      cta: "Read the protocol architecture",
      href: "/docs",
    },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * Writing
 *
 * The thesis section argues its case through published pieces rather than
 * summary cards. Add an entry here and it appears in the grid — the layout
 * alternates card widths as the list grows, so no layout change is needed.
 * Newest first.
 *
 * `image` is served through next/image, which negotiates AVIF/WebP per
 * request, so store a single reasonably-sized JPEG rather than a set.
 * ------------------------------------------------------------------------- */
export type Article = {
  title: string;
  /** ISO date. Rendered via `articleDate` so the displayed format lives here. */
  date: string;
  href: string;
  image: string;
  /** Describes the image for readers who cannot see it. */
  alt: string;
};

export const ARTICLES: readonly Article[] = [
  {
    title: "Solana Solved Retail Execution. Institutional Execution Comes Next.",
    date: "2026-07-29",
    href: "https://x.com/DarknyxProtocol/status/2082338365140046078",
    image: "/assets/articles/thesis-dark-liquidity.jpg",
    alt: "A moonlit colonnade looking out over the Acropolis, a thread of gold light running along the marble floor.",
  },
];

export function articleDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const THESIS = {
  label: "Market thesis",
  title: "Every mature market eventually separates price discovery from disclosure.",
  lede: "Equities took forty years to build the venues where size could trade without broadcasting itself. On-chain markets are arriving at the same threshold, with one advantage: the settlement layer can be verified rather than trusted.",
  closing: {
    lines: ["Public settlement is valuable.", "Public execution is not."],
    body: "Darknyx is built on that single distinction.",
  },
} as const;

export const WHITEPAPER = {
  label: "Whitepaper",
  title: "The full architecture, and the research behind it.",
  body: "Venue design and market structure, the account-commitment state model, proof system and settlement pipeline, and the trust boundary set out in full with its limits.",
  cta: "Read the whitepaper",
} as const;

export const CONTACT_SECTION = {
  label: "Contact",
  title: "Bring us the trade you'd rather nobody saw.",
  body: "Darknyx is in active development on Solana. We work directly with funds, trading desks and market makers ahead of the private mainnet beta.",
  audiences: [
    "Funds and trading desks",
    "Market makers",
    "Treasuries",
    "Investors and partners",
  ],
  primaryCta: "Talk to the team",
  secondaryCta: "Read the documentation",
} as const;

export const FOOTER = {
  tagline: "Settle in the dark · Prove in the light",
  columns: [
    {
      title: "Protocol",
      links: [
        { label: "Overview", href: "#protocol" },
        { label: "Architecture", href: "#architecture" },
        { label: "Thesis", href: "#thesis" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "How it works", href: `${CONTACT.docs}/documentation/how-it-works/trade-flow` },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", href: "#contact" },
        { label: "X / Twitter", href: CONTACT.x },
      ],
    },
  ],
  legal: "Darknyx Protocol",
} as const;
