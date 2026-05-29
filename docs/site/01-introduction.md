# Introduction

> Darknyx is a privacy-preserving central-limit-order-book (CLOB) darkpool
> on Solana. Hidden orders meet inside an attested Intel TDX
> Confidential VM; settlement happens trustlessly on Solana with
> zero-knowledge proofs binding every transfer to a verified note
> commitment. The on-chain footprint is custody and proofs;
> matching is invisible to mempools, sequencers, and validators.

---

## The problem Darknyx solves

Public order books bleed information. Every limit order resting on a
DEX is a free signal to a sandwich bot, a market maker rebalancing
inventory against you, or a counterparty looking to wait you out.
The literature calls it "informational alpha leakage"; the daily
PnL drain on Solana DEXes is measurable in tens of millions of
dollars per year. On-chain order books make this worse, not better,
than centralized venues — because the leak is permanent, public, and
indexed.

The traditional response is to take the order off-chain entirely:
quote-driven RFQ venues, off-chain matching engines, or dark pools
operated by a custodian. These solutions cost custody risk. The
operator can see every order, every fill, and every position. They
can front-run, they can leak, they can be subpoenaed, they can be
hacked. The Mt. Gox shape never goes away.

**Darknyx is the third option.** Orders enter an enclave whose code is
attested and whose key material is cryptographically gated to a
specific compiled image. The operator cannot read order intent
inside the enclave; the enclave cannot exit funds without a
zero-knowledge proof verified on Solana. The matching engine sees
hidden orders, computes a uniform clearing price, and emits a
batched validity proof that lets settlement land atomically on-chain.

---

## What "privacy-preserving" actually means in Darknyx

Three distinct privacy properties, each enforced by a separate
mechanism:

### 1. Order privacy

Order side (buy/sell), size, and limit price are visible only to the
TEE. They are not in any Solana transaction, log, or account that an
external observer can read. The TEE cannot reveal them — the
hardware attestation prevents code substitution, and the on-chain
verifier rejects any settlement that doesn't come from the attested
binary. (See [trust-model](./trust-model.md) for the full chain.)

### 2. Trader privacy

A user's Solana wallet pubkey is never a parameter in any Darknyx API
request. Users authenticate to the TEE with a separate trading-key
keypair (Ed25519, freshly generated client-side). The on-chain
settlement instructions carry only the trading key; the link from
trading key to wallet exists only in the user's own withdraw-time
VALID_SPEND proof, where the spending key never leaves their device.

### 3. Position privacy

Notes (the UTXO-style commitments Darknyx uses for assets) are stored
on-chain only as Poseidon hashes. The note's owner, value, and token
are bound inside the hash; nothing about them is observable on-chain
until the user themselves spends the note via a zero-knowledge proof.

---

## Who Darknyx is for

| Segment | Why they use Darknyx |
|---|---|
| **Active traders** | Large limit orders that don't telegraph intent. The clearing-price auction sidesteps slippage from sandwich bots; the hidden order book stops the "wait it out" game. |
| **Market makers** | A two-sided venue where quotes don't leak to retail flow before they fill. Quote turnover and inventory rebalancing remain private — the venue can't see them, competitors can't infer them. |
| **Institutions** | Trustless custody (the TEE can never withdraw funds without a user-generated ZK proof) combined with off-chain matching speed. The auditability properties (TDX attestation, multisig governance, deterministic image) satisfy compliance teams who would not approve a black-box dark pool. |
| **Treasury / OTC desks** | One-shot block trades with no market impact. The order is visible only to the TEE; the resulting on-chain settle batches with other trades, so even the settle tx doesn't single out the block. |

---

## Headline architecture

Darknyx is three layers that compose:

```text
┌────────────────────────────────────────────────────────────────┐
│  CUSTODY LAYER  — Solana program (vault)                       │
│                                                                │
│  Holds funds. Owns the Merkle tree of UTXO note commitments.   │
│  Verifies every withdraw with a VALID_SPEND ZK proof; verifies │
│  every settlement with a VALID_MATCH_BATCH proof. The only     │
│  layer that can move tokens.                                   │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │  signed settle txs (attested TEE)
                              │
┌────────────────────────────────────────────────────────────────┐
│  MATCHING LAYER  — Intel TDX Confidential VM (darknyx-tee)         │
│                                                                │
│  Runs the order book, the matching engine, the in-TEE Groth16  │
│  prover, and the settle scheduler. Receives orders over RA-    │
│  TLS, runs a frequent-batch auction every 2 seconds, signs     │
│  settlement payloads with a key derived inside the enclave.    │
│  The enclave's compose_hash is on-chain in vault_config; only  │
│  that compiled image can produce valid signatures.             │
└────────────────────────────────────────────────────────────────┘
                              ▲
                              │  signed order intents (Ed25519)
                              │
┌────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER  — TypeScript SDK                                │
│                                                                │
│  Generates ZK proofs (VALID_INPUT for deposits, VALID_SPEND    │
│  for withdraws), signs canonical order bodies, attests the     │
│  TEE's measurement chain before trusting it, and manages       │
│  three distinct user identities (wallet / trading key / API    │
│  credentials).                                                 │
└────────────────────────────────────────────────────────────────┘
```

The three-layer separation is the privacy story:

- **Solana sees**: deposit notes (Poseidon hashes), Merkle root
  updates, settlement transactions (with trading keys, not wallet
  keys), withdraw VALID_SPEND proofs.
- **The TEE sees**: orders signed by trading keys, the matching
  results, the canonical payload it signs.
- **Each user sees**: their own wallet → trading-key link, their
  own notes, their own spending keys.

No single component sees enough to deanonymize a user's trading.

## Where to go from here

If you're skimming for the **technology overview**, continue to
[architecture-overview](./architecture-overview.md).

If you're evaluating the **trust model**, jump to
[trust-model](./trust-model.md).

If you want the **settlement details** (what actually happens
on-chain), go to [settlement-pipeline](./settlement-pipeline.md).

If you're an integrator, [api-and-integration](./api-and-integration.md)
is the wire contract.

