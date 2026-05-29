# Roadmap and status

> Darknyx is building private, non-custodial trading infrastructure for Solana.
> This page summarizes the public product direction without exposing internal
> engineering logs or release history.

---

## Current status

Darknyx is in active development with the core custody, matching, cryptography,
and API surfaces documented in this guide. The system is designed around three
public guarantees:

1. **User custody stays on-chain.** Funds remain in the Solana vault program and
   move only through valid proofs and settlement instructions.
2. **Order intent stays private.** Matching happens inside an attested TEE, with
   users submitting signed orders through the API.
3. **Settlement is verifiable.** Batched settlement proofs and TEE signatures bind
   matched fills to on-chain execution.

---

## Product roadmap

### Near term

| Focus | Outcome |
|---|---|
| API integration polish | Stable REST and WebSocket surfaces for wallets, trading UIs, and market makers |
| Settlement observability | Clear lifecycle states from order submission through final settlement |
| Attestation UX | Easier client-side verification of the TEE measurement and signer key |
| SDK ergonomics | Cleaner helpers for order signing, proof generation, and settlement polling |

### Medium term

| Focus | Outcome |
|---|---|
| Multi-market support | Multiple spot markets with market-specific cadence and risk parameters |
| Performance benchmarks | Public latency and throughput numbers for matching and settlement |
| Mainnet readiness | Audit review, governance hardening, and immutable custody deployment |
| Liquidity tooling | Better integration paths for market makers and professional trading interfaces |

### Longer term

| Focus | Outcome |
|---|---|
| Advanced order tooling | Higher-level order strategies built on top of the core limit / IOC / FOK primitives |
| Portfolio-aware risk | Support for richer position and balance models while preserving privacy |
| Stronger attestation options | Evaluate direct on-chain verification as Solana and TEE tooling improve |
| Cryptography upgrades | Track practical proving-system improvements that can reduce user latency and on-chain cost |

---

## What Darknyx is not building

- **A custodial exchange.** Users retain custody through the vault program.
- **A centralized order book leak.** Raw order intent is not published on-chain.
- **A protocol token dependency.** The design does not require a token to align
  users, integrators, and operators.
- **A general-purpose bridge.** Darknyx focuses on Solana-native private trading.

---

## Contributing

The highest-value contributions are integrations, SDK feedback, threat-model
review, performance testing, and documentation improvements that make the system
easier for external builders to understand.
