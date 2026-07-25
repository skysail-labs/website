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
  docs: "https://darknyx.gitbook.io/darknyx",
} as const;

export const contactHref = CONTACT.email
  ? `mailto:${CONTACT.email}?subject=${encodeURIComponent("Darknyx introduction")}`
  : CONTACT.x;

export const NAV_LINKS = [
  { label: "Protocol", href: "#protocol" },
  { label: "Architecture", href: "#architecture" },
  { label: "Thesis", href: "#thesis" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  eyebrow: "Private execution for Solana markets",
  headline: "Move size without showing your hand.",
  body: "Darknyx is a non-custodial private execution venue for professional traders. Orders are matched inside an attested confidential environment, while trade amounts and execution prices remain hidden during on-chain settlement.",
  primaryCta: "Talk to the team",
  secondaryCta: "Explore the protocol",
} as const;

export const MARKET_GAP = {
  label: "The market gap",
  title: "Large orders should not become public signals.",
  intro:
    "Public markets expose more than transactions. They expose direction, size, urgency and strategy. For professional traders, that information can create adverse price movement before an order is fully executed.",
  panels: [
    {
      index: "01",
      venue: "Public AMMs",
      heading: "Open by design.",
      body: "AMMs make liquidity permissionless and composable, but large trades remain visible and interact with public liquidity curves. Size becomes price impact, and execution intent becomes observable.",
    },
    {
      index: "02",
      venue: "PropAMMs",
      heading: "Excellent retail execution. Limited institutional neutrality.",
      body: "PropAMMs have significantly improved execution for ordinary swaps. Their proprietary pricing and balance-sheet-driven liquidity work well for retail-sized flow, but they remain dealer-controlled venues rather than neutral markets for confidential block execution.",
    },
    {
      index: "03",
      venue: "Centralised exchanges",
      heading: "Private, but not verifiable.",
      body: "Centralised venues conceal orders from the public, but require traders to surrender custody and trust an opaque operator with balances, matching and settlement.",
    },
  ],
  conclusion:
    "The missing layer is a market-neutral venue where large orders can meet privately without sacrificing custody or verifiable settlement.",
  transition: [
    { text: "Transparent but exposed", state: "past" },
    { text: "Private but trusted", state: "past" },
    { text: "Private and verifiable", state: "now" },
  ],
} as const;

export const SOLUTION = {
  label: "The protocol",
  title: "Private execution. Verifiable settlement.",
  intro:
    "Darknyx separates execution confidentiality from settlement trust. Order intent remains inside an attested Intel TDX confidential VM, while Solana and zero-knowledge proofs constrain how assets and private balances may be updated.",
  pillars: [
    {
      icon: "flow",
      heading: "Confidential order flow",
      body: "Orders are submitted directly to the confidential execution environment. Side, size, limit and backing note never enter a public order book or L1 transaction.",
    },
    {
      icon: "match",
      heading: "Private matching",
      body: "Private bids and asks are matched through a uniform-clearing-price auction inside the enclave, subject to market controls and an external TWAP circuit breaker.",
    },
    {
      icon: "veil",
      heading: "Hidden settlement details",
      body: "Trade amounts and execution prices remain hidden on-chain. Traders receive their fills privately and recover their resulting note balances through the client.",
    },
    {
      icon: "vault",
      heading: "Non-custodial, constrained settlement",
      body: "Assets remain inside the Solana vault. Groth16 proofs constrain conservation, note creation, fees and valid balance transitions, while replay-protection accounts prevent double use.",
    },
  ],
  flow: [
    { step: "01", label: "Submit privately", note: "Order intent never touches a public book." },
    { step: "02", label: "Match in TDX", note: "Uniform clearing price inside the enclave." },
    { step: "03", label: "Prove the batch", note: "Groth16 constrains every transition." },
    { step: "04", label: "Settle on Solana", note: "Amounts and prices stay hidden." },
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

export const THESIS = {
  label: "Market thesis",
  title: "Every mature market eventually separates price discovery from disclosure.",
  lede: "Equities took forty years to build the venues where size could trade without broadcasting itself. On-chain markets are arriving at the same threshold, with one advantage: the settlement layer can be verified rather than trusted.",
  points: [
    {
      index: "I",
      heading: "Serious size needs a room, not a stage.",
      body: "As professional flow moves on-chain, the venues that win institutional volume will be the ones where a position can be built without the market reading it in real time. Transparency of settlement is a feature. Transparency of intent is a cost.",
    },
    {
      index: "II",
      heading: "Confidentiality without custody is now buildable.",
      body: "Attested hardware and practical proving systems have converged. A venue can conceal execution from everyone, including its own operator, while proving to the chain that no value was created, duplicated or misdirected.",
    },
    {
      index: "III",
      heading: "Neutrality is the durable moat.",
      body: "Dealer-run venues optimise for their own book. A market-neutral confidential venue accrues the flow that cannot accept counterparty discretion: funds, treasuries and market makers who need execution quality without surrendering their strategy.",
    },
  ],
  closing: {
    lines: ["Public settlement is valuable.", "Public execution is not."],
    body: "Darknyx is built on that single distinction.",
  },
} as const;

export const CONTACT_SECTION = {
  label: "Contact",
  title: "Speak with the team.",
  body: "Darknyx is in active development on Solana devnet. We work directly with funds, market makers, treasuries and ecosystem partners ahead of the private mainnet beta.",
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
        { label: "How it works", href: `${CONTACT.docs}/how-it-works/trade-flow` },
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
