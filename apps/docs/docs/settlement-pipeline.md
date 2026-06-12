---
sidebar_position: 7
title: Settlement pipeline
description: How a matched batch settles on Solana — a proof-gated, tree-sharded, concurrently-sent sequence of transactions that co-include in a single block.
---

# Settlement pipeline

:::info TL;DR
When a batch matches inside the enclave, it settles on Solana as a short
sequence of transactions: **lock** the input notes, **verify** the batch proof,
**settle** each match, then **close** out. The settles are spread across several
Merkle-tree shards and fee-payer keys and fired **concurrently**, so the leader
packs them into a single block instead of one slot each. Every step is gated by
a proof or a signature — the enclave can't settle anything the chain hasn't
verified.
:::

## The shape of a settle

Each batch the matcher produces flows through the same path on Solana:

```text
   per batch
   ─────────────────────────────────────────────────────────────
   1. lock_note  (×N inputs)       pin the input notes for this batch
   2. verify_match_batch           submit the batch ZK proof → validity marker
   3. per-batch lookup table       pack the batch's derivable accounts
   4. tee_forced_settle_batched    settle each match (×N), concurrently
   5. close_batch_validity_marker  reclaim the marker's rent
   ─────────────────────────────────────────────────────────────
```

**1 — Lock.** Each input note is pinned by a `lock_note` instruction so it can't
be withdrawn or double-matched mid-settlement. The locks for a batch are built
off one blockhash and **sent concurrently**, so dozens confirm in roughly one
block window instead of serially.

**2 — Verify.** A single `verify_match_batch` submits the batch's
`VALID_MATCH_BATCH` Groth16 proof and the Merkle root it committed to. The proof
attests that *all* N matches in the batch are valid — correct clearing price,
conserved value, well-formed outputs. It writes one **validity marker** that the
settle step consumes.

**3 — Pack.** Solana caps a transaction at 1232 bytes, and the settle
transaction sits right at that edge. The accounts a settle touches that are
*derivable from its payload* (the note locks, the spent-note and nullifier
guards, the marker) are placed in a per-batch **Address Lookup Table**, which
compresses each 32-byte account reference to a 1-byte index. The table is
extended in chunks, fired concurrently, so building it costs about one block,
not one per chunk.

**4 — Settle.** `tee_forced_settle_batched` is the atomic settle for one match:
it consumes both input notes, mints the output and change notes, moves value
between the two sides, charges the protocol fee, and emits a `TradeSettled`
event. Each carries the enclave's Ed25519 signature over a canonical payload
hash. The N settles in a batch are **fired together** (see below).

**5 — Close.** One `close_batch_validity_marker` reclaims the rent the marker
held. One marker covers the whole batch — it is *not* closed per match.

## Why tree-sharding

Settlement throughput is gated by how many settle transactions land per block.
Two things used to serialize them: every settle wrote the **same** Merkle-tree
account, and every settle was paid by the **same** fee-payer key. Solana's
leader executes conflicting transactions one after another *within* a block, so
those shared writable accounts pushed the settles across many slots.

Nyx **shards the tree** into several independent `MerkleTree` accounts and
derives a **separate fee-payer key per shard**, all inside the enclave. The
scheduler round-robins each match onto a `(shard, key)` pair, so the concurrent
settles share **no writable account**. With nothing to serialize on, the leader
co-includes a batch's settles in a single block.

```text
   match 0 ──▶ (key 0, tree 0)  ┐
   match 1 ──▶ (key 1, tree 1)  │  no shared writable account
   match 2 ──▶ (key 2, tree 2)  ├─▶  leader co-includes them
   match 3 ──▶ (key 3, tree 3)  ┘     in one block
   match 4 ──▶ (key 0, tree 0)  …round-robin…
```

:::note This is invisible to you
Sharding is a throughput technique inside settlement. Your notes, proofs, and
balances don't change — a note simply lives in one shard, and the SDK tracks
which. Withdrawals and inclusion proofs work exactly the same.
:::

## Concurrency, and the one remaining wait

Firing a batch's settles concurrently is what turns "one settle per slot" into
"a batch per block." The residual latency is **not** Nyx's compute — proving and
the on-chain settle are fast. It's a Solana finality detail: a freshly-extended
lookup table only becomes *loadable* by a transaction about one slot after it
roots. That one-slot wait is block-finality-bound and closes with Solana's move
to sub-second finality — not something Nyx can shave off in code.

## The prover

The batch proof is generated **inside the enclave**, so the match data never
leaves it. Nyx ships two interchangeable Groth16 backends behind one interface,
selectable at boot; both emit byte-identical proofs. The real lever on proving
latency turned out to be **vCPU count**, not the backend — so deployment sizing
matters more than the prover choice. With on-chain settlement no longer the
bottleneck, proving is now the throughput ceiling, and it scales with hardware.

## What makes it safe

Settlement is atomic and replay-proof by construction:

- **Proof-gated.** No settle without a verified `VALID_MATCH_BATCH` proof and
  the enclave's registered signature.
- **One-touch notes.** Each consumed note creates a spent-note PDA and a
  nullifier PDA; a second attempt to touch it simply fails to initialize. The
  same note can never be settled, withdrawn, or merged twice — these paths share
  the nullifier guard.
- **The marker is 1:N.** One validity marker authorizes the whole batch and is
  closed exactly once, after every match in it settles.
- **Conservation.** Both legs pay their own protocol fee and both fee notes
  mint; the proof rejects any match where value in ≠ value out.

If any step fails, the others are independent transactions — the worst case is a
batch that doesn't complete, never a partial or double settlement.

## Following a settle

Because order intent never appears on-chain, you follow a fill through the
enclave, not by scanning Solana:

- `GET /settlement/status/{batch_id}` maps a batch to its on-chain signatures.
- The per-account `/ws/fills` stream pushes each fill the moment it settles.
- An off-enclave indexer serves your fill history by order ID for backfill.

See the [API reference](./api-reference) for all three.

