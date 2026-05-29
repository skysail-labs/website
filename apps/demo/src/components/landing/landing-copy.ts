/** Plain-language strings for the marketing landing page. */

export const hero = {
  lede:
    "Darknyx brings dark-pool market structure to Solana: private order intent, attested matching, and on-chain settlement that can be verified instead of trusted.",
  aside:
    "Built for active traders, market makers, and institutions that need discretion without giving up custody or auditability.",
};

export const marketStats = [
  {
    value: "40%+",
    label: "U.S. equity volume often trades off-exchange",
    source: "FINRA OTC/ATS transparency",
  },
  {
    value: "13F scale",
    label: "Institutions routinely need discretion for large portfolio moves",
    source: "SEC institutional reporting context",
  },
  {
    value: "0 mempool",
    label: "Darknyx keeps crypto order intent out of public pre-trade view",
    source: "Darknyx design goal",
  },
];

export const plainBand = {
  eyebrow: "What are dark pools?",
  title: "Private trading venues exist because large orders reveal too much when they hit a public book.",
  lede:
    "In traditional markets, dark pools let institutions seek liquidity without broadcasting their full intent before execution. The trade-off is trust: users rely on the venue to route and match fairly.",
  points: [
    {
      title: "The public-book problem",
      body: "A large visible buy or sell order can move the market before the trader finishes execution. The order itself becomes a signal.",
    },
    {
      title: "The dark-pool answer",
      body: "A private venue hides pre-trade intent while still matching buyers and sellers. Institutions use this to reduce information leakage and market impact.",
    },
    {
      title: "The crypto gap",
      body: "Public blockchains are transparent by default. Darknyx adds private matching without turning settlement into a custodial black box.",
    },
  ],
};

export const institutionalBenefits = {
  eyebrow: "Why institutions care",
  title: "Dark pools protect execution quality when the order itself is valuable information.",
  lede:
    "Large traders are not just buying or selling assets — they are managing information leakage, slippage, signaling risk, and execution certainty.",
  cards: [
    {
      title: "Lower market impact",
      body: "Hide size before execution so the market has less opportunity to move against the order.",
    },
    {
      title: "Less signaling",
      body: "Avoid turning strategy, inventory changes, or portfolio rebalancing into public pre-trade data.",
    },
    {
      title: "Discreet liquidity",
      body: "Search for counterparties without exposing the entire shape of the trade to competitors.",
    },
    {
      title: "Cleaner execution",
      body: "Batching reduces the continuous priority race that rewards fast observers over patient liquidity.",
    },
  ],
};

export const hardProblem = {
  eyebrow: "Why this is hard in crypto",
  title: "A crypto dark pool has to hide intent without hiding accountability.",
  lede:
    "The hard part is not matching orders. The hard part is preserving privacy, user custody, fair execution, and public settlement guarantees at the same time.",
  points: [
    {
      title: "Privacy",
      body: "Orders cannot leak into public mempools, account state, logs, or venue dashboards before execution.",
    },
    {
      title: "Custody",
      body: "The venue should never be able to withdraw user funds or rewrite balances off-chain.",
    },
    {
      title: "Fairness",
      body: "The matching rule must reduce front-running and avoid giving the operator a privileged execution path.",
    },
    {
      title: "Verifiability",
      body: "After a fill, users and observers need enough proof material to trust settlement without seeing private order data.",
    },
  ],
};

export const solutionCards = {
  eyebrow: "Darknyx approach",
  title: "Private like a dark pool. Verifiable like crypto infrastructure.",
  titleMuted: "No custodial black box.",
  cards: [
    {
      eyebrow: "01 · Private intent",
      title: "Orders stay dark\nuntil they clear.",
      sub: "Side, price, and size are sent to an attested matcher instead of a public order book.",
      cluster: "TEE",
      tech: "Intel TDX",
      image: "/card-1.jpg",
    },
    {
      eyebrow: "02 · User custody",
      title: "Funds stay in\nthe Solana vault.",
      sub: "The matcher can propose fills, but only the custody layer can move assets under proof checks.",
      cluster: "L1",
      tech: "Solana",
      image: "/card-3.jpg",
    },
    {
      eyebrow: "03 · Fair batches",
      title: "One batch,\none clearing price.",
      sub: "Frequent-batch auctions reduce the value of racing or reading order flow ahead of others.",
      cluster: "FBA",
      tech: "Batch auction",
      image: "/card-2.jpg",
    },
    {
      eyebrow: "04 · Verified exits",
      title: "Settlement can\nbe checked.",
      sub: "Proofs, signatures, and on-chain state transitions make fills auditable without exposing strategy.",
      cluster: "ZK",
      tech: "Proofs",
      image: "/card-4.jpg",
    },
  ],
};

export const stack = {
  eyebrow: "Four-part architecture",
  body:
    "Darknyx separates the sensitive path from the money path: matching happens privately, while custody and settlement remain on Solana.",
  items: [
    { label: "Solana vault", detail: "Custody, note commitments, exits, and final settlement" },
    { label: "Intel TDX", detail: "Private matching in an attested confidential VM" },
    { label: "Proof layer", detail: "Validity checks for spends, batches, and settlement" },
    { label: "Trading key", detail: "Order identity separate from wallet custody" },
  ],
};

export const flow = {
  eyebrow: "How it works",
  title: "From private intent to verified settlement.",
  titleMuted: "The UX stays familiar.",
  lede:
    "Users sign custody actions with their wallet and sign orders with a separate trading key. Darknyx keeps the sensitive path private and the money path verifiable.",
  stages: [
    {
      title: "Fund privately",
      body: "Deposit into the vault and receive private note commitments instead of exposing a public trading balance.",
    },
    {
      title: "Match in batches",
      body: "Submit signed order intent to the attested matcher. Compatible orders clear in frequent batches at a uniform price.",
    },
    {
      title: "Settle on-chain",
      body: "Fills land on Solana with proof material and the registered TEE signature. Withdrawals remain user-controlled.",
    },
  ],
  footnote:
    "The docs expand this into custody, matching, cryptography, trust model, API, and integration details.",
};

export const cta = {
  title: "Privacy without sacrificing auditability",
  titleMuted: "",
  body: "Start with the technical docs for the trust model, settlement pipeline, API surface, and competitive differentiation.",
};
