# Darknyx Darkpool — Architecture

This document is the system-level overview. For a **cryptographer's deep
dive** — key model, all four ZK circuits, lifecycle walkthrough,
settlement mechanics — see [`CRYPTOGRAPHY.md`](../CRYPTOGRAPHY.md). For a
quick look (TL;DR + deployed addresses + 3-step quickstart) see the
top-level [`README.md`](../README.md).

> **Currency**: this document reflects the `darknyx-v2-onchain-hardening`
> branch through the **v3.5 batched-validity migration** (current).
> Layered hardenings, in landing order:
>
> * **v2** — `VALID_INPUT` proof at lock time, `NoteLock.token_mint`
>   cryptographically bound, `MAX_LOCK_TTL_SLOTS` ceiling, per-mint
>   `outstanding[mint]` solvency counter.
> * **v3** — `VALID_CREATE` proof + `ValidCreateMarker` PDA gating
>   `tee_forced_settle`.
> * **v3.1** — `VALID_PRICE` proof + `ValidPriceMarker` PDA so the
>   clearing price is bound by a Groth16, not a TEE-controlled Pyth
>   check. v0-transaction + ALT migration for the settle tx.
> * **v3.5 (current)** — one batched `VALID_MATCH_BATCH` proof attests
>   VALID_CREATE + VALID_PRICE for ALL matches in a batch (N ≤ 16) at
>   once. `verify_match_batch` writes one `BatchValidityMarker` PDA
>   per batch (keyed by Merkle root); `tee_forced_settle_batched`
>   walks a depth-4 inclusion proof against it;
>   `close_batch_validity_marker` reclaims rent after the last settle.
>   **Phase 1c-hard is DONE** — the v3.1 per-match ixs
>   (`verify_valid_create`, `verify_valid_price`, `tee_forced_settle`),
>   their state structs / VK consts / circom circuits, and the SDK
>   builders that targeted them have all been removed. Production
>   matchers use `buildSettleBatchedIx`; multi-match batches use the
>   `settleBatchViaBatched` helper. See `docs/v3.5-migration.md`.
>
> The legacy v1 deployment on `main` lives at the program IDs noted
> at the bottom of this file (untouched by the v2/v3/v3.5 work — its
> own program IDs differ).

---

## Table of contents

1. [System overview](#system-overview)
2. [Project layout](#project-layout)
3. [Privacy architecture](#privacy-architecture)
4. [Component-by-component walkthrough](#component-by-component-walkthrough)
5. [End-to-end transaction flow](#end-to-end-transaction-flow)
6. [Account / PDA reference](#account--pda-reference)
7. [Cryptographic primitives](#cryptographic-primitives)
8. [Security model + threat assumptions](#security-model--threat-assumptions)
9. [What is NOT yet shipped](#what-is-not-yet-shipped)

---

## System overview

```
     ┌───────────────┐ deposit (L1)         ┌─────────────────────┐
     │  User wallet  ├───────────────────► │  vault::deposit     │
     │  (browser)    │   note added to     │  (Solana L1)        │
     └──────┬────────┘   Merkle tree       └─────────────────────┘
            │
            │ submit_order (ER, JWT-gated PER RPC)
            │ ★ side / price / amount / note_commitment NEVER touch L1
            ▼
   ┌────────────────────────┐  run_batch (ER)
   │  PendingOrder PDA      ├──────────────────► uniform-clearing-price
   │  (delegated to ER)     │                    match in the rollup
   └─────────┬──────────────┘
             │ commit + undelegate (ER → L1)
             ▼
       BatchResults snapshot lands back on L1
             │
             │ TEE signs canonical payload(s), batches L1 txs
             ▼
   ┌────────────────────────────────────────────────────────────┐
   │ STEP A — vault::lock_note ×2 per match                     │   ── VALID_INPUT proof per side (v2)
   │                                                            │
   │ STEP B (v3.5 batched, recommended) — once per batch:       │
   │   vault::verify_match_batch                                │   ── ONE VALID_MATCH_BATCH Groth16 (≤ N=16)
   │                                                            │      attests VALID_CREATE + VALID_PRICE for
   │                                                            │      every match in the batch; writes ONE
   │                                                            │      BatchValidityMarker keyed by merkle_root.
   │                                                            │
   │   STEP B (v3.1 legacy path) — per match:                   │
   │     vault::verify_valid_create                             │   ── VALID_CREATE proof + per-match marker (v3)
   │     vault::verify_valid_price                              │   ── VALID_PRICE proof + per-match marker (v3.1)
   │                                                            │
   │ STEP C — vault::tee_forced_settle_batched (v3.5) OR        │
   │          vault::tee_forced_settle      (v3.1 legacy)       │   ── Ed25519 + marker check (v3.5 walks a 4-level
   │                                                            │      Merkle inclusion path to bind this match to
   │                                                            │      the batched marker) + appends note_c (BASE
   │                                                            │      buyer) + note_d (QUOTE seller) + note_e/f
   │                                                            │      (change, if partial fill) + note_fee
   │                                                            │      (protocol, on flush).
   │                                                            │      Sent as v0 + stacked ALTs (~1130 B).
   │                                                            │
   │ STEP D (v3.5 only) — vault::close_batch_validity_marker    │   ── Lands ONCE after the last match in the
   │                                                            │      batch; refunds the marker's ~49-byte rent
   │                                                            │      to the original payer. Pre-expiry close is
   │                                                            │      payer-only; post-expiry any signer can sweep.
   └────────────────────────┬───────────────────────────────────┘
                            │ withdraw (L1, VALID_SPEND proof)
                            ▼
                      SPL tokens released to the user wallet
```

Three trust boundaries, three layers:

| Layer            | Tech                                | Purpose                                      |
|------------------|-------------------------------------|----------------------------------------------|
| **L1 (Solana)**  | Anchor 0.32 programs (vault + ME)   | Custody, Merkle tree, ZK verifier, settlement |
| **ER (rollup)**  | MagicBlock Ephemeral Rollup         | Hidden order intent + matching                |
| **Client (TS)**  | `@darknyx/sdk`, snarkjs, ZK circuits    | Key derivation, proof generation, ix builders |

---

## Project layout

```
darknyx-monorepo/
├── programs/                          # On-chain Solana programs (Anchor 0.32)
│   ├── vault/                         # Custody, UTXO Merkle tree, settlement
│   │   ├── src/
│   │   │   ├── lib.rs                 # #[program] entrypoints
│   │   │   ├── state.rs               # VaultConfig, WalletEntry, NullifierEntry,
│   │   │   │                          # ConsumedNoteEntry, NoteLock (v2: + token_mint),
│   │   │   │                          # OutstandingMint (v2), ValidCreateMarker (v3)
│   │   │   ├── merkle.rs              # Incremental Poseidon Merkle tree (depth 20)
│   │   │   ├── errors.rs
│   │   │   ├── instructions/
│   │   │   │   ├── initialize.rs              # Create the global VaultConfig singleton
│   │   │   │   ├── create_wallet.rs           # VALID_WALLET_CREATE Groth16 → WalletEntry
│   │   │   │   ├── deposit.rs                 # Pull SPL → append note + outstanding[mint]++
│   │   │   │   ├── lock_note.rs               # TEE-only, VALID_INPUT-gated (v2)
│   │   │   │   ├── release_lock.rs            # Release expired note locks
│   │   │   │   ├── verify_valid_create.rs     # v3: VALID_CREATE Groth16 → ValidCreateMarker PDA
│   │   │   │   ├── verify_valid_price.rs      # v3.1: VALID_PRICE Groth16 → ValidPriceMarker PDA
│   │   │   │   ├── verify_match_batch.rs      # v3.5: VALID_MATCH_BATCH (N=16) → BatchValidityMarker PDA
│   │   │   │   ├── tee_forced_settle.rs       # v3.1: Ed25519 + 2 marker checks + atomic settlement
│   │   │   │   ├── tee_forced_settle_batched.rs # v3.5: same, reads 1 batched marker + depth-4 Merkle proof
│   │   │   │   ├── close_batch_validity_marker.rs # v3.5: reclaim batched-marker rent after last settle
│   │   │   │   ├── withdraw.rs                # VALID_SPEND Groth16 → outstanding[mint]-- → SPL out
│   │   │   │   ├── set_protocol_config.rs     # Admin: rotate protocol-owner / fee bps
│   │   │   │   ├── rotate_root_key.rs         # PER root-key rotation
│   │   │   │   └── reset_merkle_tree.rs       # DEVNET-ONLY: tree wipe for tests
│   │   │   └── zk/                            # Embedded Groth16 verifier-key consts
│   │   │       ├── verifier.rs                # groth16-solana wrapper
│   │   │       ├── vk_valid_wallet_create.rs
│   │   │       ├── vk_valid_spend.rs
│   │   │       ├── vk_valid_input.rs          # v2 NEW
│   │   │       ├── vk_valid_create.rs         # v3 NEW
│   │   │       ├── vk_valid_price.rs          # v3.1 NEW
│   │   │       └── vk_match_batch_n16.rs      # v3.5 NEW (N=16; N=2/N=4 are dev/test only)
│   │   └── tests/                             # litesvm integration tests
│   │
│   └── matching_engine/                       # CLOB + ER session driver
│       ├── src/
│       │   ├── lib.rs
│       │   ├── state/
│       │   │   ├── pending_order.rs           # ★ Privacy-fix slot PDA
│       │   │   ├── dark_clob.rs               # Per-market metadata (mints, oracle)
│       │   │   ├── matching_config.rs         # Tick size, min order size, etc.
│       │   │   ├── batch_results.rs           # Snapshot of last batch's matches
│       │   │   ├── match_result.rs            # Single match record (one trade)
│       │   │   ├── change_note.rs             # Re-lockable partial-fill change leg
│       │   │   ├── fee_accumulator.rs         # In-batch protocol fee accrual
│       │   │   ├── order_record.rs            # Legacy order-book row (cancel-by-id)
│       │   │   └── pyth.rs                    # Pyth Pull-v2 + NYXMKPTH mock parser
│       │   ├── instructions/
│       │   │   ├── init_market.rs             # L1: create the three market PDAs
│       │   │   ├── init_mock_oracle.rs        # L1 (devnet): NYXMKPTH oracle stub
│       │   │   ├── init_pending_order_slot.rs # ★ L1 (idempotent): empty slot PDA
│       │   │   ├── delegate_pending_order.rs  # ★ L1: hand slot to ER validator
│       │   │   ├── delegate_dark_clob.rs      # L1: hand DarkCLOB PDA to ER
│       │   │   ├── delegate_matching_config.rs
│       │   │   ├── delegate_batch_results.rs
│       │   │   ├── submit_order.rs            # ★ ER-only single-account write
│       │   │   ├── cancel_order.rs            # ★ ER-only owner-authenticated cancel
│       │   │   ├── run_batch.rs               # ★ ER: matches PendingOrder remaining_accounts
│       │   │   ├── commit_market_state.rs     # ER: ScheduleCommit (keeps delegation)
│       │   │   ├── undelegate_market.rs       # ER: ScheduleCommitAndUndelegate
│       │   │   └── configure_access.rs        # PER access-control list
│       │   └── errors.rs
│       └── tests/                              # 23 litesvm integration tests
│
├── crates/
│   └── darkpool-crypto/                       # Host-side cryptography (ZK-input prep)
│       └── src/
│           ├── poseidon.rs                    # Light-protocol Poseidon2 wrapper
│           ├── note.rs                        # Note commitment: Poseidon6(mint_lo,mint_hi,amt,owner,nonce,r)
│           ├── nullifier.rs                   # Nullifier: Poseidon2(spending_key, note_commitment)
│           ├── keys.rs                        # Spending / viewing key derivation (HKDF-SHA256 + KMAC256)
│           ├── viewing_keys.rs                # Owner-commitment + r-derivation chain
│           ├── user_commitment.rs             # User commitment Poseidon helper
│           └── field.rs                       # BN254 Fr range + LE/BE encoding helpers
│
├── circuits/                                  # Circom 2 zero-knowledge circuits
│   ├── templates/match_batch.circom           # v3.5: shared parameterized template MatchBatch(N)
│   ├── valid_wallet_create/circuit.circom     # Proves knowledge of (sk, vk, r0..r2) for Wallet PDA
│   ├── valid_spend/circuit.circom             # Proves note ownership + Merkle inclusion + nullifier (withdraw)
│   ├── valid_input/circuit.circom             # v2: same as VALID_SPEND minus nullifier (lock_note)
│   ├── valid_create/circuit.circom            # v3: TEE outputs addressed to correct input owners
│   ├── valid_price/circuit.circom             # v3.1: clearing price within oracle band
│   ├── match_batch_n2/circuit.circom          # v3.5: N=2 instantiation (dev/test only)
│   ├── match_batch_n4/circuit.circom          # v3.5: N=4 instantiation (dev/test only)
│   ├── match_batch_n16/circuit.circom         # v3.5: N=16 instantiation — production
│   └── build/                                 # Compiled .wasm + .zkey (gitignored, generated)
│
├── packages/
│   └── sdk/                                   # @darknyx/sdk — TypeScript client library
│       ├── src/
│       │   ├── client.ts                      # NyxDarkpoolClient factory
│       │   ├── providers.ts                   # Injectable Solana / ER providers
│       │   ├── idl/
│       │   │   ├── seeds.ts                   # Wire-mirror of Rust SEED consts
│       │   │   ├── vault-client.ts            # buildDeposit / lock_note / settle / withdraw ixs
│       │   │   ├── matching-engine-client.ts  # PendingOrder helpers + submit/cancel/run_batch ixs
│       │   │   └── er-client.ts               # MagicBlock delegate / commit / undelegate ixs
│       │   ├── orders/
│       │   │   ├── submit-order.ts            # High-level submit-order pipeline (ER-only)
│       │   │   └── cancel-order.ts            # Cancel via the ER session
│       │   ├── batch/
│       │   │   └── inclusion-proof.ts         # Decode BatchResults + extract MatchResult records
│       │   ├── settlement/
│       │   │   ├── settle-builder.ts          # Build canonical MatchResultPayload + Ed25519 ix
│       │   │   └── settlement-watcher.ts      # Poll the on-chain settlement events
│       │   ├── per/
│       │   │   ├── attestation.ts             # PER session attestation glue
│       │   │   └── session-manager.ts         # JWT-gated ER RPC client
│       │   ├── keys/                          # Spending / viewing key gen + rotation + commit
│       │   ├── utxo/                          # Note + deposit + withdraw helpers (TS mirror of Rust)
│       │   └── zk/
│       │       └── prover-suite.ts            # snarkjs-fullProve adapter
│       └── tests/                             # 88 vitest tests (76 unit + 12 devnet-gated)
│
├── scripts/
│   ├── build-circuits.sh                      # Compile circom + run setup + write Rust VK consts
│   ├── deploy-devnet.sh                       # Idempotent program deploy to devnet
│   ├── setup-devnet.sh                        # Create + fund .devnet/keypairs/*
│   ├── parse-vk-to-rust.js                    # Convert snarkjs verification_key.json → Rust consts
│   ├── download-ptau.sh                       # Pull the powers-of-tau ceremony file
│   └── dev-commands.md                        # Master dev command cheat-sheet
│
├── .devnet/                                   # gitignored: keypairs + e2e-config.json
│   └── keypairs/                              # admin / TEE / root_key + alice/bob personas
│
├── Anchor.toml                                # Program IDs + provider config
├── Cargo.toml                                 # Rust workspace (programs + crypto crate)
├── package.json                               # npm workspaces (sdk + circuits)
└── rust-toolchain.toml                        # Pinned toolchain for build reproducibility
```

The `darkpool/` directory and the top-level `*.md` design notes
(`darkpool_protocol_spec_v3_changed.md`, `change_note_implementation.md`,
`partial_fill_and_fee_notes.md`, `order_privacy_fix.md`) are kept for
historical reference — they are NOT source-of-truth for the live code.
The code is.

---

## Privacy architecture

### What is hidden, what is public

| Object                                          | L1 visible? | Notes                                      |
|-------------------------------------------------|-------------|--------------------------------------------|
| **Order side / price / amount**                 | NO          | Stays in the ER until `run_batch` matches  |
| **Order's collateral note commitment**          | NO          | Same — only inside the ER                  |
| **User's trading-key signature on submit_order**| NO          | The whole submit tx lives in the ER        |
| **`note_commitment` of the deposit note**       | YES         | Public on `vault::deposit` (always was)    |
| **Deposit amount / mint**                       | YES         | SPL transfer is on L1                      |
| **Match clearing price + matched volume**       | YES         | Surfaces in `BatchResults` after commit    |
| **Settlement note commitments (note_c, _d, _e)**| YES         | TEE appends them in `tee_forced_settle`    |
| **Withdrawal amount + recipient ATA**           | YES         | SPL transfer-out is on L1                  |

The unmatched anonymity-set therefore consists of every order that
*entered* the ER but did not settle this batch. Once an order matches,
the leaked information is the *aggregate* match (price, total volume,
which two `note_commitment`s were spent) — not the individual order
intent that produced it.

### Why an Ephemeral Rollup?

A pure-L1 dark pool would require a TEE that *commits* L1 transactions
on the user's behalf so order intent never appears in any tx the user
signs. That is operationally fragile and adds a trusted relayer.

MagicBlock's Ephemeral Rollup gives us the property "this PDA is
writable inside an authenticated rollup session, and only commits a
*compressed snapshot* back to L1 when we explicitly schedule a commit."
We **delegate** PDAs we want to keep private (PendingOrder slots) and
**commit only the aggregate** (`BatchResults`) once a batch finishes.

### How `submit_order` becomes invisible

The privacy fix follows the [MagicBlock rock-paper-scissors
pattern](https://docs.magicblock.gg/developers/cookbook):

1. **L1, one-time per user-market pair**:
   `init_pending_order_slot(market, slot_idx)` — allocates an EMPTY
   `PendingOrder` PDA. The L1 init tx contains zero order intent.
   `delegate_pending_order(market, slot_idx)` — hands the PDA to the ER
   validator via the `#[delegate]` macro from `ephemeral_rollups_sdk`.
   From this point on, **the PDA is only writable inside the ER**.

2. **ER, per order**: `submit_order(args)` — sent to the MagicBlock ER
   RPC (gated by a PER JWT session). Writes order intent (side,
   amount, price_limit, note_commitment, user_commitment, …) directly
   into the user's delegated slot. The slot is bound by Anchor seeds to
   `(PENDING_ORDER_SEED, market, trading_key, slot_idx)` — a stranger
   cannot resolve to someone else's slot.

3. **ER, per batch**: `run_batch(market)` — the operator passes all
   participating PendingOrder PDAs as `remaining_accounts`. The handler
   reads each slot, runs the Phase-4 uniform-clearing-price match (with
   Pyth circuit breaker), writes results into the delegated
   `BatchResults` PDA, and rotates collateral on partially-filled
   slots' `collateral_note`.

3. **ER → L1**: `undelegate_market` — CPIs
   `ScheduleCommitAndUndelegate` on the magic program. MagicBlock
   commits the new `DarkCLOB` / `MatchingConfig` / `BatchResults` state
   back to L1 and returns ownership of those PDAs to `matching_engine`.
   PendingOrder slots stay delegated (so future batches can match
   without re-delegation).

4. **L1 settlement**: the TEE builds a `MatchResultPayload`, signs the
   canonical hash, and lands a sequence of atomic L1 txs. There are
   two coexisting paths during the soft-cutover window:

   **v3.5 batched path (recommended, current).** Per BATCH:
   - **Tx A — lock**: `lock_note(note_a) + lock_note(note_b)` for each
     match. Each `lock_note` ix carries a `VALID_INPUT` Groth16 proof
     binding (commitment, mint, amount) to a real Merkle leaf owned by
     the order submitter.
   - **Tx B — verify**: `verify_match_batch` lands ONE Groth16 attesting
     VALID_CREATE + VALID_PRICE for every match in the batch (padded to
     N=16 with dummy slots when the batch has < 16 real matches). Writes
     ONE `BatchValidityMarker` PDA seeded by the batch's Merkle root.
     Replaces 2N per-match verify ixs with 1.
   - **Tx C — per-batch ALT (one-shot)**: a versioned-transaction
     Address Lookup Table holding the 5 derivable PDAs not init'd by
     Anchor (`note_lock_a/b/e/f` + `batch_validity_marker`). One ALT per
     batch, amortised across all N settles. Saves ~155 bytes per settle
     vs. inline accounts (needed to keep the settle tx under 1232 B
     once the Merkle proof bytes are added).
   - **Tx D — settle, per match**: `Ed25519 precompile +
     tee_forced_settle_batched`. The handler recomputes the leaf hash
     from payload + lock mints, walks a depth-4 Merkle inclusion path
     with the caller-supplied 4 siblings + `match_index`, derives the
     expected `BatchValidityMarker` address, asserts the supplied
     marker is at that address + non-expired, then consumes locks +
     appends output leaves + re-locks change notes. Crucially does
     **NOT** close the marker (one marker covers all N matches).
   - **Tx E — close** (once per batch): `close_batch_validity_marker`
     refunds the marker's ~49 B rent to the original payer. Pre-expiry
     close is payer-only; post-expiry any signer can sweep (rent still
     flows to payer via Anchor's `has_one = payer`).

   **v3.1 per-match path (legacy, still callable).** Per MATCH: Tx A
   (lock), Tx B1 (`verify_valid_create` → `ValidCreateMarker`), Tx B2
   (`verify_valid_price` → `ValidPriceMarker`), Tx C
   (`tee_forced_settle` reads both markers and closes them). Replaced
   by the batched path for new integrations; kept callable so the
   live demo on `main` and any pre-v3.5 matcher continue to work.

   Splitting verify and settle into separate txs is necessary because
   the combined tx with embedded proofs would be ~2200 bytes — way
   over Solana's 1232-byte cap. Atomicity across the per-batch
   sequence is enforced by account dependencies: settle's account
   list requires `NoteLock` PDAs (from Tx A) and the
   `BatchValidityMarker` PDA (from Tx B) to exist. A failure of any
   upstream tx makes settle abort. See
   [`CRYPTOGRAPHY.md` §9](../CRYPTOGRAPHY.md#9-settlement-mechanics)
   for the full size analysis + ALT construction + marker-lifecycle
   details.

---

## Component-by-component walkthrough

### `programs/vault` — custody + Merkle tree + ZK + settlement

**Singletons.** `VaultConfig` is a global zero-copy PDA holding the
incremental Merkle tree state (depth 20 = 1 048 576 leaves), the last
32 historical roots, the TEE's Ed25519 pubkey, the protocol-fee config,
and a "right path" of rightmost filled nodes per level so every append
is `O(depth)` hashes.

**Per-leaf PDAs.** Every spent or locked note has its own PDA so that
two transactions referencing the same note collide at PDA-allocation
time:
- `WalletEntry` (seed `wallet`) — registered user commitments.
- `NullifierEntry` (seed `nullifier`) — VALID_SPEND-consumed notes.
- `ConsumedNoteEntry` (seed `consumed_note`) — TEE-settle-consumed notes.
- `NoteLock` (seed `note_lock`) — TEE pin between match and settle.
  Carries `token_mint` (v2) so the chain knows the mint of each input.
- `OutstandingMint` (seed `outstanding_mint`, v2) — per-mint live-notes
  counter, one PDA per SPL mint. Maintains the solvency invariant
  `outstanding ≤ vault_token_account.amount`.
- `ValidCreateMarker` (seed `valid_create`, v3) — proof-of-verification
  written by `verify_valid_create`, consumed by `tee_forced_settle`.
  Seeded by the 32-byte binding hash so its existence at a given seed
  cryptographically attests that VALID_CREATE was checked for that
  specific (commitments, mints, amounts) tuple.
- `ValidPriceMarker` (seed `valid_price`, v3.1) — same pattern as above
  for VALID_PRICE. Seeded by the price commitment = Poseidon2(domain,
  clearing_price ‖ batch_slot). Closed by `tee_forced_settle`.
- `BatchValidityMarker` (seed `batch_validity`, v3.5) — single
  PDA per BATCH (not per match) seeded by the batch's Merkle root.
  Written by `verify_match_batch` after a Groth16 attests
  VALID_CREATE + VALID_PRICE for every slot in the batch. Carries
  `(payer, expiry_slot, bump)`. NOT closed by per-match settles —
  reclaimed by `close_batch_validity_marker` after the last settle
  in the batch (payer fast-path) or by any signer after `expiry_slot`
  (GC path; rent still flows to payer).

**Settlement.** `tee_forced_settle_batched` (v3.5, recommended) is the
heart of the protocol; `tee_forced_settle` (v3.1, legacy) is its
predecessor and is byte-identical except for the validity-marker
check. Both walk the transaction's instruction list via
`sysvar::instructions::load_instruction_at_checked`, find the
`Ed25519Program` precompile ix, assert that
`pubkey == VaultConfig.tee_pubkey` and that
`msg == canonical_payload_hash(payload)` (SHA-256 over a domain tag
`b"darknyx-match-v5"` + a fixed-order serialisation of every payload
field), and only then proceed to:

1. Verify the buyer's and seller's `NoteLock` PDAs match
   `note_a_commit` / `note_b_commit` and have not expired. Capture their
   `token_mint` for use below (v2).
2. **Validity check** (path-dependent):
   * **v3.5 batched**: compute the per-slot Merkle leaf as
     `Poseidon9(DOMAIN_LEAF_TOP, Poseidon12(DOMAIN_LEAF_INNER, six note
     commitments + 4 mint-halves + base_amount), quote_amount,
     buyer_change, seller_change, buyer_fee, seller_fee, clearing_price,
     batch_slot)`. Walk a depth-4 inclusion path with the caller-
     supplied 4 siblings + `match_index` to derive the batch's Merkle
     root; assert the supplied `BatchValidityMarker` PDA is at
     `[b"batch_validity", root]`, owned by us, and not expired.
   * **v3.1 per-match**: recompute
     `binding_hash = SHA256(b"darknyx-create-bind-v1" ‖ 14 fields)` and
     `price_commitment = Poseidon2(domain, clearing_price ‖ batch_slot)`;
     assert `ValidCreateMarker` exists at `[b"valid_create", binding_hash]`
     and `ValidPriceMarker` exists at `[b"valid_price", price_commitment]`,
     both owned + unexpired.
3. Allocate two `ConsumedNoteEntry` PDAs (idempotency lock — a second
   identical match cannot replay).
4. Enforce the per-leg conservation law
   `lock.amount == trade_leg + change_leg + fee_leg` *exactly* via
   `u64::checked_add` before writing state.
5. Append up to five output leaves: `note_c` (BASE → buyer's
   owner_commitment), `note_d` (QUOTE → seller's owner_commitment),
   optional `note_e` (buyer's change in QUOTE), optional `note_f`
   (seller's change in BASE), and optional `note_fee` (protocol fee).
6. Atomically allocate fresh `NoteLock` PDAs for change notes when the
   payload requests a re-lock (partial-fill continuation).
6. **Marker lifecycle** (path-dependent):
   * **v3.5 batched**: do NOT close the marker. The marker is keyed by
     the batch's Merkle root, identical across all matches in the
     batch; closing here would brick every subsequent match. The
     matcher reclaims the rent via a separate
     `close_batch_validity_marker` ix once the batch is fully settled.
   * **v3.1 per-match**: close both `ValidCreateMarker` and
     `ValidPriceMarker`, refunding rent to their recorded payers.
8. Emit `TradeSettled { match_id, new_root, … }`.

**Solvency invariant (v2)**: at the end of every `deposit` and
`withdraw`, the handler reloads `vault_token_account` and asserts
`outstanding_mint.outstanding ≤ vault_token_account.amount`.
`tee_forced_settle` doesn't touch the counter directly because
settlement is mint-conservation-preserving (the per-side conservation
law ensures Σ inputs = Σ outputs per mint).

### `programs/matching_engine` — CLOB + ER glue

**Per-market triple.** Each market is parameterised by three PDAs:
`DarkCLOB` (mints + oracle pubkey + version), `MatchingConfig` (tick
size, batch interval, circuit breaker bps, min order size), and
`BatchResults` (last-batch snapshot — readable from L1 after commit).

**PendingOrder PDA (the privacy fix).** One per (user, market, slot_idx).
Up to `MAX_PENDING_SLOTS_PER_USER = 4` concurrent orders per user per
market. Status state machine:

```
   Empty ──► Pending ──► Matched / Expired / Cancelled
     ▲                         │
     └─── reuse (slot.clear()) ┘
```

**Matching algorithm (`run_batch`).** Phase-4 uniform clearing price:
sort bids descending, asks ascending, find the price that maximises
matched volume, and fill all crossing orders at that single clearing
price. Tie-break by `arrival_slot` (FIFO at equal price). Pyth circuit
breaker: if the clearing price diverges from the oracle TWAP by more
than `circuit_breaker_bps`, the batch is skipped (no settlement). Each
match produces a `MatchResult` with the four note commitments
(`note_a`, `note_b`, `note_c`, `note_d`) that the TEE will later sign +
settle.

### `crates/darkpool-crypto` — host-side crypto

This crate is the *only* place where TS and Rust must agree on
deterministic byte layouts. Every TS implementation (in `packages/sdk`)
has a Rust parity test (in `packages/sdk/tests/*-parity.test.ts`) that
shells out to a CLI helper compiled from
`crates/darkpool-crypto/examples/*` and compares fixture vectors
byte-for-byte. The crate is intentionally kept off the SBF target (it
uses heap, RNG, etc.) — only the on-chain verifier consumes its outputs.

Key derivation chain (HKDF-SHA256 for Ed25519 / spending key, KMAC256 for
viewing key and per-note blinding — see `crates/darkpool-crypto/src/keys.rs`):

```
    master_seed (64 B)
     ├── HKDF-SHA256("darkpool_spend_key_v1", 512b → mod r)   ──► spending_key  (s)
     ├── KMAC256   ("darkpool_viewing_key_v1", 512b → mod r)   ──► viewing_key   (v)
     ├── HKDF-SHA256("darkpool_root_key_v1", 32 B)            ──► root_key (Ed25519)
     ├── HKDF-SHA256("darkpool_trading_key_v1" ‖ offset, 32B) ──► trading_key(offset)
     └── KMAC256   ("note_blinding_v1" ‖ counter, 512b → mod r) ──► blinding_r(i)

    user-commitment chain (independent r0, r1, r2 blinders):
        leafPair    = Poseidon2( Poseidon3(root_lo, root_hi, r0),
                                 Poseidon2(s, r1) )
        user_commit = Poseidon2( leafPair, Poseidon2(v, r2) )

    owner-commitment chain (separate r_owner blinder, reused across all notes):
        owner_commitment = Poseidon2(s, r_owner)
```

Note commitment: `note = Poseidon6(mint_lo, mint_hi, amount, owner_commitment, nonce, blinding_r)`.
The Solana mint pubkey is split into two 128-bit halves because a single
BN254 Fr element cannot hold all 256 bits of a pubkey.

Nullifier: `nullifier = Poseidon2(spending_key, note_commitment)`. Bound to
the commitment, not the leaf index — so two notes with identical contents
but different positions still have different commitments (because
`blinding_r` depends on the leaf-time counter) and therefore different
nullifiers. Leaks nothing about which note was spent unless the spending
key is known.

### `circuits/` — zero-knowledge proofs

Four Groth16 circuits, all pre-compiled to `.wasm` (witness gen) +
`.zkey` (proving key) by `scripts/build-circuits.sh`. For detailed
constraints + public/private input shapes see
[`CRYPTOGRAPHY.md` §7](../CRYPTOGRAPHY.md#7-the-five-zk-circuits).

- **VALID_WALLET_CREATE** — 1 public input, ~250 constraints. Binds a
  `user_commitment` to (root, spending, viewing) keys at `create_wallet`.

- **VALID_SPEND** — 5 public inputs `(merkle_root, nullifier, mint_lo,
  mint_hi, amount)`, ~7000 constraints. Proves note ownership + Merkle
  inclusion + correct nullifier derivation at `withdraw`.

- **VALID_INPUT** (v2 NEW) — 5 public inputs `(merkle_root,
  note_commitment, mint_lo, mint_hi, amount)`, 5500 constraints.
  Essentially VALID_SPEND minus the nullifier, exposing the commitment
  publicly so the `lock_note` ix's PDA seed matches. Used at lock time
  to prove the locked note is real and owned by the prover.

- **VALID_CREATE** (v3 NEW) — 16 public inputs (6 commitments + 2 mints
  split + 6 amounts), 2148 constraints. Proves the TEE constructed
  output notes correctly: `note_c` is BASE mint addressed to the
  buyer's `owner_commitment` (= the owner from note_a), `note_d` is
  QUOTE addressed to the seller, change notes have the right mint and
  the right owner, conservation holds per-side. Conditional change
  notes encoded via `IsZero` selectors. Used at the
  `verify_valid_create` ix before settle (v3.1 path); subsumed into
  VALID_MATCH_BATCH (v3.5).

- **VALID_PRICE** (v3.1 NEW) — Proves the clearing price sits inside the
  Pyth-band `|clearing_price − oracle_twap| ≤ oracle_twap *
  circuit_breaker_bps / 10_000`. Public inputs: `price_commitment` =
  Poseidon2(domain, clearing_price ‖ batch_slot). Lands as
  `verify_valid_price` before settle (v3.1 path); subsumed into
  VALID_MATCH_BATCH (v3.5).

- **VALID_MATCH_BATCH** (v3.5 NEW) — 1 public input
  (`merkle_root` over per-slot leaves), 162 947 constraints at N=16.
  Parameterised by `N ∈ {2, 4, 16}` (only N=16 is wired on-chain;
  N=2 and N=4 are dev/test instances used by
  `match-batch-prototype.test.ts`). Inside the circuit each slot
  runs the VALID_CREATE + VALID_PRICE constraints simultaneously,
  emits a leaf hash, and the top-level template walks those leaves
  up a depth-`log2(N)` Poseidon Merkle tree. Net effect: one Groth16
  + one marker replaces 2N per-match verify ixs and 2N markers.
  Setup needs `powersOfTau28_hez_final_18.ptau` (~288 MB) because
  total constraints exceed 2^16; the build script downloads it
  automatically. Leaf-hash arity caps Poseidon at 12 inputs
  (on-chain `light-poseidon` MAX_X5_LEN=13), so the leaf is built
  as a Poseidon12 + a Poseidon9 stage rather than a single hash.

The verifier keys are baked into the on-chain `vault` program at
`programs/vault/src/zk/vk_*.rs` (regenerated from the snarkjs JSON via
`scripts/parse-vk-to-rust.js`). All four legacy circuits + the N=16
batched circuit are wired on-chain; N=2/N=4 batched circuits are
host-side only for dev/test.

### `packages/sdk` — TypeScript client

Thin, no-magic, factory-function API. Three guarantees:
1. **No Anchor IDL parser at runtime.** The SDK hand-codes every
   instruction discriminator + Borsh layout. Faster, less fragile, and
   the ix builder is the source of truth for the on-chain wire format.
2. **Injectable providers.** Every long-lived object (`Connection`, ER
   `Connection`, `PerSessionManager`, `Signer`, prover suite) is passed
   into the factory. Easy to mock in tests.
3. **Staged errors.** Errors are tagged with the stage they were thrown
   from (`SubmitStage`, `SettleStage`, `WithdrawStage`, …) so a UI can
   render *what was happening* when something failed.

Notable modules:
- `idl/matching-engine-client.ts` — `pendingOrderPda`,
  `buildInitPendingOrderSlotInstruction`,
  `buildDelegatePendingOrderInstruction`,
  `buildSubmitOrderInstruction`, `buildCancelOrderInstruction`,
  `buildRunBatchInstruction`.
- `idl/vault-client.ts` — every `vault` ix builder +
  `buildLockNoteInstruction` (TEE-side allocation of `NoteLock` PDAs).
- `idl/er-client.ts` — `openDualConnections`, `waitForL1AccountChange`,
  `buildDelegateDarkClobInstruction`,
  `buildCommitMarketStateInstruction`,
  `buildUndelegateMarketInstruction`.
- `orders/submit-order.ts` — high-level pipeline: derive note → build
  args → send to ER RPC → return ix-signature + inclusion commitment.
- `settlement/settle-builder.ts` — canonical `MatchResultPayload`
  Rust-mirror, Ed25519 precompile ix builder, `buildSettleIx`.

---

## End-to-end transaction flow

A complete trade in the privacy-fix flow (from a fresh user to settled
balances). Each row is one transaction. Cluster column is L1 (Solana
mainnet/devnet) or ER (MagicBlock Ephemeral Rollup).

| #     | Cluster | Instruction(s)                                                             | Who signs                      | Privacy / soundness property                                            |
|-------|---------|----------------------------------------------------------------------------|--------------------------------|-------------------------------------------------------------|
| 1     | L1      | `vault::create_wallet` (with VALID_WALLET_CREATE proof)                   | user payer                     | links `user_commitment` to a Solana payer; identity-only.   |
| 2     | L1      | `vault::deposit`                                                           | user payer                     | reveals deposit amount + mint; bumps `outstanding[mint]` (v2). |
| 3a    | L1      | `matching_engine::init_pending_order_slot`                                 | user trading_key               | empty PDA, **zero order intent**.                           |
| 3b    | L1      | `matching_engine::delegate_pending_order`                                  | funder + user trading_key      | hand slot to ER validator.                                  |
| 4     | L1      | `matching_engine::delegate_dark_clob` + delegate_matching_config + delegate_batch_results | admin                | hand market PDAs to ER (one-time per market).             |
| 5     | **ER**  | `matching_engine::submit_order`                                           | user trading_key               | **HIDDEN** — order intent never on L1.                      |
| 6     | **ER**  | `matching_engine::run_batch` (operator-driven, periodic)                  | TEE / operator                 | match all delegated slots in the rollup.                    |
| 7     | **ER**  | `matching_engine::undelegate_market`                                      | TEE / operator                 | commits BatchResults back to L1 + returns ownership.        |
| 8     | L1      | poll: `BatchResults` PDA owner = matching_engine                          | none                           | confirm L1 commit landed.                                    |
| 9a    | L1      | `vault::lock_note(note_a)` + `vault::lock_note(note_b)` per match (Tx A)  | TEE                            | v2: each ix carries a **VALID_INPUT** proof binding (commitment, mint, amount) to a real Merkle leaf. TEE cannot phantom-lock. |
| 9b ★  | L1      | **v3.5** `vault::verify_match_batch` — ONCE per batch                     | any payer (proof is the auth)  | v3.5: **VALID_MATCH_BATCH** Groth16 attests VALID_CREATE + VALID_PRICE for every slot in the batch (N=16, dummies padded). Writes ONE `BatchValidityMarker` PDA keyed by `merkle_root`. |
| 9b'   | L1      | (legacy) `vault::verify_valid_create` + `vault::verify_valid_price`       | any payer                      | v3.1: per-match `ValidCreateMarker` + `ValidPriceMarker`. Coexists with 9b during cutover; new integrations should use 9b. |
| 9c-1  | L1      | `AddressLookupTableProgram::createLookupTable+extend` — ONCE per batch    | TEE                            | v3.5: per-batch ALT holding the 5 derivable PDAs (`note_lock_a/b/e/f` + `batch_validity_marker`). Saves ~155 B per settle; needed to keep the settle tx under 1232 B once the Merkle proof bytes are added. |
| 9c-2  | L1      | `Ed25519` precompile + `vault::tee_forced_settle_batched` (v0 + 2 ALTs)    | TEE                            | v3.5: atomic consume + append. Recomputes the leaf, walks the 4-level Merkle inclusion path, asserts the marker PDA address matches, enforces conservation. Settle marker is NOT closed here (one marker, many matches). |
| 9c'   | L1      | (legacy) `Ed25519` + `vault::tee_forced_settle` (v0 + 1 ALT)              | TEE                            | v3.1 fallback path; closes both per-match markers. |
| 9d ★  | L1      | `vault::close_batch_validity_marker` — ONCE per batch (after last 9c-2)   | TEE (or anyone post-expiry)    | v3.5: reclaims the marker's ~49 B rent. Pre-expiry: payer-only fast-path. Post-expiry: anyone can sweep; rent flows to payer via Anchor `has_one`. |
| 10    | L1      | `vault::withdraw` (with VALID_SPEND proof)                                | recipient                      | spends a note, reveals amount + mint + recipient ATA; decrements `outstanding[mint]` (v2). |

In the running tests, steps 3a/3b happen once per persona ever (slot
PDAs are reused), step 4 happens once per market ever, and step 5 is
the hot-path ER tx that users hit.

---

## Account / PDA reference

### Vault PDAs

| PDA                  | Seeds                                                | Purpose                                |
|----------------------|------------------------------------------------------|----------------------------------------|
| `VaultConfig`        | `["vault_config"]`                                   | Singleton — Merkle tree + TEE pubkey   |
| `WalletEntry`        | `["wallet", commitment]`                             | One per registered user commitment     |
| `NullifierEntry`     | `["nullifier", nullifier]`                           | One per VALID_SPEND-consumed note      |
| `ConsumedNoteEntry`  | `["consumed_note", note_commitment]`                 | One per TEE-settled note (settlement replay guard) |
| `NoteLock`           | `["note_lock", note_commitment]`                     | TEE pin between match and settle. Carries `token_mint` (v2). |
| `OutstandingMint`    | `["outstanding_mint", mint]`                         | v2: per-mint live-notes counter (Tier-1 solvency invariant) |
| `ValidCreateMarker`  | `["valid_create", binding_hash]`                     | v3: written by `verify_valid_create`, consumed by `tee_forced_settle`. Seed encodes the 14 bound values. |
| `ValidPriceMarker`   | `["valid_price", price_commitment]`                  | v3.1: written by `verify_valid_price`, consumed by `tee_forced_settle`. Seed encodes (clearing_price, batch_slot). |
| `BatchValidityMarker`| `["batch_validity", merkle_root]`                    | v3.5: written by `verify_match_batch`. ONE per batch — covers all matches sharing the same `merkle_root`. Read by every `tee_forced_settle_batched` in the batch; closed by `close_batch_validity_marker` after the last one. |
| Vault token ATA      | `["vault_token", mint]`                              | Per-mint SPL custody account           |

### Matching engine PDAs

| PDA              | Seeds                                                          | Purpose                                                  |
|------------------|----------------------------------------------------------------|----------------------------------------------------------|
| `DarkCLOB`       | `["dark_clob", market]`                                        | Mints + oracle + version                                 |
| `MatchingConfig` | `["matching_config", market]`                                  | Tick size, min order size, batch interval, circuit-bps   |
| `BatchResults`   | `["batch_results", market]`                                    | Last batch snapshot (committed back to L1 from ER)       |
| `PendingOrder`   | `["pending_order", market, trading_key, slot_idx]`             | **Privacy-fix**: per-user delegated order slot           |
| `MockOracle`     | `["mock_oracle", market]`                                      | DEVNET-ONLY NYXMKPTH stub (TWAP)                         |

---

## Cryptographic primitives

| Primitive        | Choice                                                    | Where                                                  |
|------------------|-----------------------------------------------------------|--------------------------------------------------------|
| Curve            | BN254 (alt_bn128)                                          | Groth16 verifier on-chain, snarkjs prover off-chain    |
| Hash (in-circuit)| Poseidon over BN254 Fr (arities 2, 3, 6, 9, 12)            | Note commitments, nullifiers, Merkle, user commitments, v3.5 batched leaves (arity 12 + 9) |
| Hash (ambient)   | SHA-256                                                    | Canonical payload hash, VALID_CREATE binding hash      |
| Key derivation   | HKDF-SHA256 (spending, root, trading) + KMAC256 (viewing, per-note blinding) | Master-seed → all four keys + note blinding |
| Signature        | Ed25519 (Solana Ed25519 precompile)                        | TEE attestation in `tee_forced_settle`, trading-key on `submit_order` |
| KEM              | None — direct payload to TEE via PER session              | (planned: TLS+attestation channel)                     |
| ZK proof system  | Groth16                                                    | VALID_WALLET_CREATE, VALID_SPEND, VALID_INPUT (v2), VALID_CREATE (v3), VALID_PRICE (v3.1), VALID_MATCH_BATCH N=16 (v3.5) |
| Merkle tree      | Incremental Poseidon2, depth 20, 32-root ring buffer       | `vault::merkle.rs`                                     |

The on-chain Groth16 verifier is `groth16-solana` v0.2.0 (the alt_bn128
syscall path). All four circuits use the same Powers-of-Tau ceremony
file (`powersOfTau28_hez_final_16.ptau`, downloaded by
`scripts/download-ptau.sh` — pot16 + pot18 SHA-256-pinned since 2026-05-24) and the same
deterministic dev contribution. Real Phase-2 MPC required before
mainnet.

---

## Security model + threat assumptions

What the system protects against:

- **Front-running on L1** of unmatched orders (their intent is in the
  ER, not on L1).
- **Replay of TEE-signed settlements** — `ConsumedNoteEntry` PDAs lock
  both legs. A second identical `tee_forced_settle` collides at PDA
  allocation.
- **Withdrawals without ownership proof** — VALID_SPEND requires
  knowledge of the spending key; `NullifierEntry` PDAs prevent double-spend.
- **Conservation violations** — `tee_forced_settle` enforces
  `lock.amount == trade_leg + change_leg + fee_leg` *exactly* via
  `u64::checked_add` before state mutation; the TEE cannot "create" tokens.
- **Mismatched canonical hashes** — the `Ed25519` precompile message
  must equal `canonical_payload_hash(payload)`; a TEE that signs a
  different message than the on-chain payload is rejected.
- **TEE phantom-locking a note that doesn't exist (v2)** — `lock_note`
  requires a `VALID_INPUT` Groth16 proof binding (commitment, mint,
  amount) to a real Merkle leaf owned by the order submitter.
- **TEE forever-locking a note as censorship (v2)** — `lock_note`
  rejects `expiry_slot > clock.slot + MAX_LOCK_TTL_SLOTS` (~24h).
- **TEE misrouting output legs / mis-minting outputs (v3)** —
  `tee_forced_settle` requires a `ValidCreateMarker` PDA at a seed
  derived from the recomputed binding hash. The marker exists only if
  `verify_valid_create` verified a VALID_CREATE proof binding all
  output notes to the correct input owners with the correct mints.
  v3.5 folds this into VALID_MATCH_BATCH (one Groth16 attests
  VALID_CREATE for every match in the batch at once).
- **TEE clearing at a manipulated price (v3.1)** —
  `tee_forced_settle` requires a `ValidPriceMarker` PDA at a seed
  derived from `price_commitment = Poseidon2(domain, clearing_price ‖
  batch_slot)`. The marker exists only if `verify_valid_price`
  verified a VALID_PRICE Groth16 proof attesting the clearing price
  sits inside the Pyth-band `|clearing_price − oracle_twap| ≤
  oracle_twap * circuit_breaker_bps / 10000`. v3.5 folds this into
  VALID_MATCH_BATCH (one Groth16 attests VALID_PRICE for every match
  in the batch at once). Moves the price guard from TEE-controlled
  `run_batch` to a verifier-controlled Groth16 — closes the original
  "TEE clears at any price inside circuit-breaker tolerance" hole.
- **Premature marker close in a multi-match batch (v3.5)** — the
  `BatchValidityMarker` is 1:N (one per batch, N matches per
  marker). `tee_forced_settle_batched` deliberately does NOT close
  it; rent reclamation goes through the separate
  `close_batch_validity_marker` ix. The class-of-regression
  ("close after every match would brick matches 1..N-1") is gated
  by a Rust litesvm test
  (`programs/matching_engine/tests/tee_forced_settle_batched.rs::test_two_matches_share_one_marker`).
- **Vault over-claim by phantom-mint outputs (v2)** — per-mint
  `outstanding[mint]` counter; `withdraw` rejects with
  `InsufficientOutstanding` before SPL transfer if the counter is
  below the requested amount.

What the system explicitly does **not** yet protect against (see
"What is NOT yet shipped" below):

- A compromised TEE host — `tee_pubkey` is still a software Ed25519
  keypair, not a hardware-attested enclave measurement.
- Aggregate trade-level analysis after `BatchResults` commits — the
  match volume and price are public.
- Network-level traffic analysis of who is connecting to the ER RPC
  (mitigated by the PER JWT session manager but not eliminated).
- Trusted-setup soundness — the four circuits use a deterministic dev
  contribution, recoverable from the build script. Mainnet requires a
  real Phase-2 MPC.

---

## What is NOT yet shipped

v2 + v3 + v3.1 + v3.5 closed every cryptographic gap from the original
brief (phantom-locking, forever-locking, output misrouting, mint
mis-claiming, price manipulation, per-match verify overhead). Sorted
roughly by cryptographic impact remaining:

1. **Real Phase-2 ceremony** — All four shipped Groth16 circuits use a
   deterministic dev contribution. The toxic waste is therefore
   *recoverable from the build script* (`echo "darknyx-phase1-dev-contribution-$name"`
   passed as entropy). Real MPC with ≥ 3 independent contributors and
   publicly verifiable transcripts required before mainnet. Both PTAU
   files (pot16 + pot18) are SHA-256-pinned in `scripts/download-ptau.sh`
   since 2026-05-24 — but they're still the *public Hermez ceremony*,
   not a project-specific MPC. Mainnet needs the latter.

   v3.5 batched zkeys are generated deterministically via
   `zkey beacon 0102…1f20 10` (10 contribution rounds with a fixed
   beacon string) so CI can rebuild the same VK consts from source —
   useful during development but does NOT replace a real ceremony.

2. **Real TDX/SEV TEE + remote attestation** (Phase 6). The TEE is
   currently a local Ed25519 keypair acting as the signing authority.
   Production deploys must pin the key inside an attested enclave.
   Also need a `rotate_tee_pubkey` ix gated by attestation quote
   verification.

3. **Browser prover** (`WebProverSuite`) replacing the snarkjs
   shell-out. Today the SDK shells out to
   `node_modules/snarkjs/build/cli.cjs`, which is fine on a server but
   unwieldy in a wallet extension.

4. **Indexer service** — see `apps/demo/ARCHITECTURE.md` for the
   "no-indexer tax." A production indexer (Geyser/Helius webhook +
   postgres + witness API) would eliminate ~40% of the dapp's
   complexity (Merkle replay, pending-slot probing, BatchResults ring
   scanning, etc.).

5. **`undelegate_pending_order`** — let users release a slot back to L1
   to refund rent. Today slots stay delegated forever.

6. **Emergency `force_undelegate_on_l1`** admin ix (pressure valve if
   the ER is down).

7. **Real protocol-owner keypair** for fee withdrawal. Fee notes
   accumulate but can't be spent until a real protocol-owner key is
   wired in. `change-note-flow` Test E exercises this under a synthetic
   commitment.

8. **Continuous ER ↔ L1 commit scheduler** inside the TEE loop. Today
   the test commits manually via `undelegate_market`. Production wants
   `commit_market_state` (keeps delegation) every N slots so settlement
   can pick up matches without a full undelegate cycle.

9. **Oracle refresh inside long-running ER sessions** — Pyth Pull-v2
    accounts are clone-at-open today.

10. **PER JWT session manager** wired into the ER trade-flow test —
    the on-chain privacy property is independent of this, but the
    network-side anonymity-set requires JWT-gated ingress to be
    effective.

11. **Self-trade prevention** in `run_batch` — cheap to add (check
    same `user_commitment`), more about anti-leakage than soundness.

---

## Deployment runbook

This is the minimum set of steps to take a freshly-cloned repo from
nothing → trade settling on devnet through the v3.5 batched path.
Every command should be run from the repo root. Full per-command
detail (env-vars, troubleshooting, single-test invocations) lives in
[`scripts/dev-commands.md`](../scripts/dev-commands.md); use this
section to know the *order* and the *moving parts*.

### 1. One-time host setup

```sh
npm install                                # circomlib + snarkjs + SDK deps
bash scripts/download-ptau.sh              # pot16 (~80 MB) + pot18 (~288 MB)
bash scripts/build-circuits.sh             # all 6 circom circuits → .wasm + .zkey
cargo build --examples -p darkpool-crypto  # TS↔Rust parity helper binaries
```

`build-circuits.sh` writes the verifier-key Rust consts directly into
`programs/vault/src/zk/vk_*.rs` (one per circuit, including
`vk_match_batch_n16.rs`). If you change a circuit, you must rerun the
script + commit both the regenerated `.zkey` AND the regenerated
`vk_*.rs` together — CI compiles the program against the committed
VK consts.

### 2. Compile + deploy programs

```sh
cargo build-sbf --manifest-path programs/vault/Cargo.toml
cargo build-sbf --manifest-path programs/matching_engine/Cargo.toml
bash scripts/deploy-devnet.sh              # idempotent upgrade in place
```

The deploy script reuses the program-id keypairs already committed at
`target/deploy/{vault,matching_engine}-keypair.json`, so addresses
don't change across deploys. Upgrade authority is your local
`~/.config/solana/id.json` (must hold ≥ 5 SOL on devnet for the
upgrade fee). If you regenerate the program keypairs you must also
update `declare_id!` in both `lib.rs`'s and `Anchor.toml` — the
`consistency` CI job will catch any mismatch.

### 3. Initialise devnet state (mints, market, ALT, Merkle tree)

```sh
RUN_DEVNET_E2E=1 \
  ADMIN_KEYPAIR=.devnet/keypairs/admin.json \
  TEE_AUTHORITY_KEYPAIR=.devnet/keypairs/tee_authority.json \
  ROOT_KEY_KEYPAIR=.devnet/keypairs/root_key.json \
  ( cd packages/sdk && ../../node_modules/.bin/vitest run tests/devnet-setup.test.ts )
```

This is the only step that *mutates* shared global state. It writes
`.devnet/e2e-config.json` with the resolved market PDA, mint
pubkeys, ALT pubkey, and protocol-config — every other test reads
this file. Re-run it whenever the on-chain Merkle tree diverges from
the SDK's shadow tree (it calls `vault::reset_merkle_tree` under
the hood).

### 4. Validate end-to-end on the v3.5 batched path

```sh
# L1-only happy path
RUN_DEVNET_E2E=1 \
  ADMIN_KEYPAIR=.devnet/keypairs/admin.json \
  TEE_AUTHORITY_KEYPAIR=.devnet/keypairs/tee_authority.json \
  ROOT_KEY_KEYPAIR=.devnet/keypairs/root_key.json \
  FUNDER_KEYPAIR=~/.config/solana/id.json \
  ( cd packages/sdk && ../../node_modules/.bin/vitest run tests/devnet-trade-flow.test.ts )

# Change-note / partial-fill / multi-batch / real-fee-withdraw
RUN_CN_E2E=1 \
  ADMIN_KEYPAIR=.devnet/keypairs/admin.json \
  TEE_AUTHORITY_KEYPAIR=.devnet/keypairs/tee_authority.json \
  FUNDER_KEYPAIR=~/.config/solana/id.json \
  ( cd packages/sdk && ../../node_modules/.bin/vitest run tests/change-note-flow.test.ts )

# Ephemeral-Rollup hidden-order-intent path
RUN_ER_E2E=1 \
  ADMIN_KEYPAIR=.devnet/keypairs/admin.json \
  TEE_AUTHORITY_KEYPAIR=.devnet/keypairs/tee_authority.json \
  FUNDER_KEYPAIR=~/.config/solana/id.json \
  ( cd packages/sdk && ../../node_modules/.bin/vitest run tests/er-trade-flow.test.ts )
```

Each invocation runs the full pipeline (deposit → optional ER
match → lock → `verify_match_batch` → `tee_forced_settle_batched` →
`close_batch_validity_marker` → withdraw) and prints per-step
timings + explorer links for every landed tx.

Dropping `USE_BATCHED_PROOF` falls back to the v3.1 legacy path
(per-match `verify_valid_create` + `verify_valid_price` +
`tee_forced_settle`). Both paths run against the same deployed
programs — pick per matcher.

### 5. CI gating

Two GitHub-Actions workflows:

* `pr-checks.yml` — runs on every push / PR. Includes the Rust
  workspace tests, all six circuits compile, the SDK unit suite
  (which now covers both `buildSettleBatchedIx` and
  `buildCloseBatchValidityMarkerIx`), and the litesvm integration
  tests (including the v3.5 `tee_forced_settle_batched.rs`
  regression test that drives two real matches through one shared
  marker).
* `nightly-devnet.yml` — fires on cron + on PR comment
  `/test-devnet`. Default invocation exercises the v3.1 path so the
  legacy ixs keep getting coverage during cutover; appending
  `--batched` (`/test-devnet --batched`) exports
  `USE_BATCHED_PROOF` for the whole job and gates v3.5 instead.
  Combine with `--partial-fill` / `--skip-er` as needed.

### 6. Production matcher checklist

For a production matcher landing real volume (rather than the
single-match-per-batch test flows above), the v3.5 helper layout
should be modified so:

- Per BATCH (not per match) the matcher creates **one** per-batch
  ALT containing the 5 derivable PDAs (`note_lock_a/b/e/f` +
  `batch_validity_marker`), then lands **one**
  `verify_match_batch`.
- Each of the N matches lands its own `tee_forced_settle_batched`
  tx with its own `match_index` + Merkle inclusion proof.
- After the last settle, the matcher lands **one**
  `close_batch_validity_marker` to reclaim the ~49 B marker rent.
- ALT deactivation has a 512-slot cooldown (~3.5 minutes), so a
  rolling-pool pattern is necessary if batches run faster than that.
  See [`docs/v3.5-migration.md`](v3.5-migration.md) for the
  256-addresses-per-ALT cap analysis and the two-ALT-rolling-pool
  recommendation.

---

## Deployed program IDs

| Branch | vault | matching_engine |
|---|---|---|
| **`darknyx-v2-onchain-hardening`** (v3 — described in this doc) | `C63vKvysCzX55PKraas4Wc22ijqjGJQdPC1mrzCFVWZx` | `6EasFxo6RCWrK4KAwcdUJqL4KjReLC3rtah8EtHgHSqe` |
| `main` (legacy v1 — hackathon demo) | `ELt4FH2gH8RaZkYbvbbDjGkX8dPhGFdWnspM4w1fdjoY` | `DvYcaiBuaHgJFVjVd57JLM7ZMavzXvBezJwsvA46FJbH` |

The two deployments coexist on devnet at different addresses, so the
live demo on `main` is unaffected by the v2/v3 work.
