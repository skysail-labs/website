const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const portalSrc = path.join(workspaceRoot, 'portal');
const docsDest = path.join(workspaceRoot, 'docs/docs');

// 1. Recursive copy from portal/ to docs/docs/ (excluding README.md)
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    if (path.basename(src) !== 'README.md') {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log('Copying files from portal/ to docs/docs/...');
copyRecursive(portalSrc, docsDest);

// 2. Mermaid diagram replacement rules
const rules = [
  {
    file: 'account/01-account-model.md',
    replacements: [
      {
        detect: 'your spending key',
        replaceWith: `\`\`\`mermaid
flowchart TD
    KEY["your spending key"]
    TREE["public Merkle tree of note commitments"]
    OWN["the notes you own"]
    AMOUNTS["their amounts"]
    BALANCE["your spendable balance"]
    UNSPENT["which are unspent (no nullifier published)"]
    ACTION["what you can trade or withdraw"]

    KEY & TREE --> OWN
    OWN --> AMOUNTS
    AMOUNTS --> BALANCE
    OWN --> UNSPENT
    UNSPENT --> ACTION
\`\`\``
      },
      {
        detect: 'deposit            place order',
        replaceWith: `\`\`\`mermaid
flowchart LR
    DEPOSIT["deposit"] --> SPENDABLE
    SPENDABLE -->|"place order"| LOCKED
    LOCKED -->|"settle / withdraw"| CONSUMED

    SPENDABLE["SPENDABLE<br/>(in tree, no nullifier)"]
    LOCKED["LOCKED<br/>(pinned by a per-order lock)"]
    CONSUMED["CONSUMED (and new notes created)<br/>(nullified; value lives in output notes)"]
\`\`\``
      }
    ]
  },
  {
    file: 'api/03-transport-and-attestation.md',
    replacements: [
      {
        detect: 'TLS (key generated inside the enclave',
        replaceWith: `\`\`\`mermaid
flowchart LR
    CLIENT["client"]
    ENCLAVE["Confidential VM (enclave)<br/>plaintext exists ONLY here"]

    CLIENT -->|"TLS (key generated inside enclave, never exported)<br/>(no gateway/load balancer in trust path)"| ENCLAVE
\`\`\``
      }
    ]
  },
  {
    file: 'get-started/01-overview.md',
    replacements: [
      {
        detect: 'CUSTODY — the Solana "vault"',
        replaceWith: `\`\`\`mermaid
flowchart LR
    CLIENT["Client<br/>(Wallet + SDK)"] -->|"signed orders & ZK input proofs<br/>(HTTPS/WS)"| MATCHING["Matching<br/>(Confidential VM)"]
    MATCHING -->|"attested settle txs & ZK proofs"| CUSTODY["Custody<br/>(Solana Vault)"]

    classDef default fill:#14121d,stroke:#d6be8b,stroke-width:1px,color:#f5f3ee;
\`\`\``
      }
    ]
  },
  {
    file: 'how-it-works/01-trade-flow.md',
    replacements: [
      {
        detect: 'Wallet │ ───────────► │  Vault (L1)',
        replaceWith: `\`\`\`mermaid
flowchart TD
    subgraph L1 ["Solana L1 (On-Chain)"]
        VAULT["Vault (L1)<br/>- Custody of funds<br/>- Note tree / commitments"]
    end

    subgraph TEE ["TEE Enclave (Confidential VM)"]
        ENCLAVE["Enclave (matching)<br/>- Batch auction<br/>- Prove matches<br/>- Settle on L1"]
    end

    subgraph ClientSpace ["Client / SDK"]
        WALLET["Wallet"]
        SDK["Client / SDK<br/>- Build note & proof<br/>- Sign order"]
        CLIENT["Client<br/>- Receive fill memos & events"]
    end

    WALLET -->|"deposit (funds → note)"| VAULT
    SDK -->|"signed order + input proof<br/>(via RA-TLS HTTPS/WS)"| ENCLAVE
    VAULT -->|"verify note exists in tree"| ENCLAVE
    ENCLAVE -->|"settle txs + ZK proof"| VAULT
    ENCLAVE -->|"fill memos + order events"| CLIENT
\`\`\``
      }
    ]
  },
  {
    file: 'how-it-works/02-tee-architecture.md',
    replacements: [
      {
        detect: 'Intel TDX quote + measured event log',
        replaceWith: `\`\`\`mermaid
flowchart TD
    A["Intel TDX quote + measured event log"]
    B["client verifies the approved image and complete signer set"]
    C["finalized VaultConfig contains that same ordered signer set"]
    D["Solana accepts a settlement only with a registered signature and a valid Groth16 proof"]

    A --> B --> C --> D
\`\`\``
      }
    ]
  },
  {
    file: 'how-it-works/04-shielded-pool.md',
    replacements: [
      {
        detect: 'root  (one hash over all notes)',
        replaceWith: `\`\`\`mermaid
graph TD
    ROOT["root (one hash over all notes)"]
    L1["…"]
    L2["…"]
    LEAF1["leaf (note commitment)"]
    LEAF2["leaf"]
    LEAF3["leaf"]
    LEAF4["leaf …"]

    ROOT --> L1
    ROOT --> L2
    L1 --> LEAF1
    L1 --> LEAF2
    L2 --> LEAF3
    L2 --> LEAF4

    NOTE["your note: you hold a secret opening + an inclusion path"] -.-> LEAF1
\`\`\``
      },
      {
        detect: 'publish nullifier(note)',
        replaceWith: `\`\`\`mermaid
flowchart TD
    SPEND["spend note"] --> PUB["publish nullifier(note)"]
    RETRY["try to spend it again"] --> COLLISION{"same nullifier already on-chain?"}
    COLLISION -->|Yes| REJECTED["rejected (prevent double-spend)"]
\`\`\``
      },
      {
        detect: 'note appended to the tree (SPENDABLE)',
        replaceWith: `\`\`\`mermaid
flowchart TD
    deposit(["deposit"]) --> SPENDABLE["SPENDABLE<br/>(note appended to tree)"]
    SPENDABLE -->|"place order"| LOCKED["LOCKED<br/>(pinned by per-order lock)"]
    LOCKED -->|"settle"| CONSUMED["CONSUMED<br/>(input nullified)"]
    SPENDABLE -->|"withdraw"| WITHDRAWN["WITHDRAWN<br/>(note nullified; tokens released to wallet)"]

    subgraph Outputs ["New Output Notes Appended"]
        filled["filled asset (new note)"]
        change["change note (unfilled remainder)"]
        fee["fee notes"]
    end

    CONSUMED --> Outputs
    Outputs -->|"become"| SPENDABLE
\`\`\``
      }
    ]
  },
  {
    file: 'how-it-works/05-settlement.md',
    replacements: [
      {
        detect: 'reserve matched orders',
        replaceWith: `\`\`\`mermaid
flowchart TD
    A["reserve matched orders"]
    B["lock both input commitments before their expiry"]
    C["verify one batch proof on-chain"]
    D["send match 1 independently → confirmed / rejected / ambiguous"]
    E["send match 2 independently → confirmed / rejected / ambiguous"]
    F["marker reclaimed only after its expiry"]

    A --> B --> C
    C --> D
    C --> E
    D --> F
    E --> F
\`\`\``
      }
    ]
  },
  {
    file: 'how-it-works/06-fee-structure.md',
    replacements: [
      {
        detect: 'settle a match ──► outputs:',
        replaceWith: `\`\`\`mermaid
flowchart LR
    SETTLE["settle a match"] --> OUTPUTS["outputs:"]
    OUTPUTS --> OUT1["counterparty's filled asset"]
    OUTPUTS --> OUT2["your change note (unfilled remainder)"]
    OUTPUTS --> OUT3["fee note (base side) ➔ protocol"]
    OUTPUTS --> OUT4["fee note (quote side) ➔ protocol"]
\`\`\``
      }
    ]
  },
  {
    file: 'websocket/01-ws-trading.md',
    replacements: [
      {
        detect: 'socket opens  ──►  order.place',
        replaceWith: `\`\`\`mermaid
flowchart LR
    A["socket opens"] --> B["order.place ×N"] --> C["(connectivity lost / socket closes)"]
    C --> D["engine cancels this session's still-resting orders"]
\`\`\``
      }
    ]
  },
  {
    file: 'websocket/02-orders-channel.md',
    replacements: [
      {
        detect: 'order.place ──► pending_settlement',
        replaceWith: `\`\`\`mermaid
flowchart TD
    PLACE["order.place"]
    PENDING["pending_settlement"]
    PF["partially_filled"]
    FF["fully_filled (terminal)"]
    SF["settlement_failed (terminal; fresh order required)"]
    REST["(rests)"]
    EC["expired / cancelled (terminal)"]

    PLACE --> PENDING
    PENDING --> PF
    PF -->|"…"| FF
    PENDING --> SF
    PLACE --> REST
    REST --> EC
\`\`\``
      }
    ]
  }
];

function processDiagrams(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  const matches = [];
  while ((match = codeBlockRegex.exec(content)) !== null) {
    matches.push({ full: match[0], lang: match[1], code: match[2] });
  }

  const fileRule = rules.find(r => filePath.endsWith(r.file));
  if (!fileRule) return;

  for (const rep of fileRule.replacements) {
    const targetBlock = matches.find(block => block.code.includes(rep.detect));
    if (targetBlock) {
      content = content.replace(targetBlock.full, rep.replaceWith);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Restored Mermaid diagrams in: ${filePath}`);
  }
}

// 3. YAML frontmatter quoting for descriptions with colons
function processYAMLQuotes(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return;

  let frontmatter = frontmatterMatch[1];
  const originalFrontmatter = frontmatter;
  const lines = frontmatter.split(/\r?\n/);
  const newLines = lines.map(line => {
    if (line.startsWith('description:')) {
      const descVal = line.slice('description:'.length).trim();
      if (descVal.includes(':') && !descVal.startsWith('"') && !descVal.startsWith("'")) {
        const escapedVal = descVal.replace(/"/g, '\\"');
        return `description: "${escapedVal}"`;
      }
    }
    return line;
  });

  const newFrontmatter = newLines.join('\n');
  if (newFrontmatter !== originalFrontmatter) {
    content = content.replace(frontmatterMatch[1], newFrontmatter);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Quoted frontmatter description in: ${filePath}`);
  }
}

// 4. Strip "link" from _category_.json for collapsible sidebar
function stripCategoryLinks(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      stripCategoryLinks(fullPath);
    } else if (entry === '_category_.json') {
      let cat = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (cat.link) {
        delete cat.link;
        fs.writeFileSync(fullPath, JSON.stringify(cat, null, 2) + '\n', 'utf8');
        console.log(`Stripped category link from: ${fullPath}`);
      }
    }
  }
}

rules.forEach(rule => {
  processDiagrams(path.join(portalSrc, rule.file));
  processDiagrams(path.join(docsDest, rule.file));
});

function walkAndProcessMarkdown(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      walkAndProcessMarkdown(fullPath);
    } else if (entry.endsWith('.md')) {
      processYAMLQuotes(fullPath);
    }
  }
}

walkAndProcessMarkdown(portalSrc);
walkAndProcessMarkdown(docsDest);

console.log('Stripping category index links...');
stripCategoryLinks(docsDest);

console.log('Done.');
