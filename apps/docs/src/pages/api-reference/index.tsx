import React, { useEffect, useState, useRef } from "react";
import Layout from "@theme/Layout";
import { Highlight, themes } from "prism-react-renderer";
import jsYaml from "js-yaml";
import styles from "./styles.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Schema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: unknown[];
  example?: unknown;
  $ref?: string;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  additionalProperties?: boolean | Schema;
}

interface Parameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: Schema;
}

interface MediaType {
  schema?: Schema;
  example?: unknown;
}

interface RequestBody {
  required?: boolean;
  description?: string;
  content?: Record<string, MediaType>;
}

interface Response {
  description?: string;
  content?: Record<string, MediaType>;
}

interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>;
  security?: Record<string, string[]>[];
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

interface OpenAPISpec {
  info: { title: string; description?: string; version: string };
  servers?: { url: string; description?: string }[];
  tags?: { name: string; description?: string }[];
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, Schema>; securitySchemes?: Record<string, unknown> };
}

interface EndpointEntry {
  method: string;
  path: string;
  operation: Operation;
  tag: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function methodColor(method: string) {
  switch (method.toLowerCase()) {
    case "get":    return styles.methodGet;
    case "post":   return styles.methodPost;
    case "put":    return styles.methodPut;
    case "delete": return styles.methodDelete;
    case "patch":  return styles.methodPatch;
    default:       return styles.methodGet;
  }
}

function statusColor(code: string) {
  const n = parseInt(code);
  if (n >= 200 && n < 300) return styles.status2xx;
  if (n >= 400 && n < 500) return styles.status4xx;
  if (n >= 500) return styles.status5xx;
  return "";
}

function resolveRef(ref: string, spec: OpenAPISpec): Schema | null {
  const parts = ref.replace("#/", "").split("/");
  let cur: unknown = spec;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else return null;
  }
  return cur as Schema;
}

function resolveSchema(schema: Schema | undefined, spec: OpenAPISpec, depth = 0): Schema | null {
  if (!schema) return null;
  if (schema.$ref) return resolveRef(schema.$ref, spec);
  if (schema.allOf) return resolveSchema(schema.allOf[0], spec, depth);
  return schema;
}

function buildExample(schema: Schema | undefined, spec: OpenAPISpec, depth = 0): unknown {
  if (!schema || depth > 4) return null;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, spec);
    return buildExample(resolved ?? undefined, spec, depth + 1);
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.allOf) return buildExample(schema.allOf[0], spec, depth + 1);
  if (schema.oneOf) return buildExample(schema.oneOf[0], spec, depth + 1);
  if (schema.enum) return schema.enum[0];

  switch (schema.type) {
    case "object": {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(schema.properties ?? {})) {
        obj[k] = buildExample(v, spec, depth + 1);
      }
      return obj;
    }
    case "array":
      return [buildExample(schema.items, spec, depth + 1)];
    case "string":
      return schema.format === "password" ? "••••••••" : "string";
    case "integer": case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return null;
  }
}

function schemaTypeName(schema: Schema | undefined, spec: OpenAPISpec): string {
  if (!schema) return "";
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop() ?? "";
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved?.type) return `${name} (${resolved.type})`;
    return name;
  }
  if (schema.allOf) return schemaTypeName(schema.allOf[0], spec);
  if (schema.type === "array") {
    const inner = schemaTypeName(schema.items, spec);
    return inner ? `${inner}[]` : "array";
  }
  const base = schema.type ?? "";
  return schema.format ? `${base}<${schema.format}>` : base;
}

// ─── Schema renderer ─────────────────────────────────────────────────────────

function SchemaProperty({ name, schema, spec, required, depth = 0 }: {
  name: string;
  schema: Schema;
  spec: OpenAPISpec;
  required?: boolean;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const resolved = schema.$ref ? (resolveRef(schema.$ref, spec) ?? schema) : schema;
  const hasChildren = resolved.properties || resolved.items?.properties ||
    (resolved.type === "array" && resolved.items);

  return (
    <div className={styles.schemaRow} style={{ paddingLeft: `calc(20px + ${depth * 16}px)` }}>
      <div className={styles.schemaHeader} onClick={() => hasChildren && setOpen(o => !o)}>
        <span className={styles.propName}>{name}</span>
        <span className={styles.propType}>{schemaTypeName(schema, spec)}</span>
        {required && <span className={styles.propRequired}>required</span>}
        {hasChildren && (
          <span className={styles.expandIcon}>{open ? "▾" : "▸"}</span>
        )}
      </div>
      {resolved.description && (
        <div className={styles.propDesc}>{resolved.description}</div>
      )}
      {resolved.enum && (
        <div className={styles.propEnum}>
          Values: {resolved.enum.map(String).join(", ")}
        </div>
      )}
      {open && resolved.properties && (
        <div className={styles.nestedProps}>
          {Object.entries(resolved.properties).map(([k, v]) => (
            <SchemaProperty
              key={k}
              name={k}
              schema={v}
              spec={spec}
              required={resolved.required?.includes(k)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      {open && resolved.type === "array" && resolved.items && (
        <div className={styles.nestedProps}>
          <SchemaProperty
            name="[item]"
            schema={resolved.items}
            spec={spec}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  );
}

function SchemaPanel({ schema, spec, title }: { schema: Schema; spec: OpenAPISpec; title?: string }) {
  const resolved = schema.$ref ? (resolveRef(schema.$ref, spec) ?? schema) : schema;
  const props = resolved.properties ?? {};

  return (
    <div className={styles.schemaPanel}>
      {title && <div className={styles.schemaPanelTitle}>{title}</div>}
      {Object.entries(props).map(([k, v]) => (
        <SchemaProperty
          key={k}
          name={k}
          schema={v}
          spec={spec}
          required={resolved.required?.includes(k)}
        />
      ))}
      {resolved.type === "array" && resolved.items && (
        <SchemaProperty name="[item]" schema={resolved.items} spec={spec} />
      )}
    </div>
  );
}

// ─── Code block ──────────────────────────────────────────────────────────────

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.codeBlock}>
      <button className={styles.copyBtn} onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <Highlight theme={themes.oneDark} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} ${styles.codeBlockPre}`} style={{ ...style, backgroundColor: "#1e2028", margin: 0, padding: "16px", fontSize: 13, borderRadius: 6, overflow: "auto" }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, j) => <span key={j} {...getTokenProps({ token })} />)}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

// ─── Right panel: code snippet + responses ────────────────────────────────────

function RightPanel({ method, path, operation, spec, server }: {
  method: string;
  path: string;
  operation: Operation;
  spec: OpenAPISpec;
  server: string;
}) {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const statusCodes = Object.keys(operation.responses ?? {});
  const firstStatus = statusCodes[0] ?? null;
  const displayStatus = activeStatus ?? firstStatus;

  useEffect(() => { setActiveStatus(null); }, [operation]);

  const curlLines: string[] = [`curl -X ${method.toUpperCase()} '${server}${path}'`];
  if (operation.security?.length) {
    curlLines.push(`  -H 'Authorization: Bearer $TOKEN'`);
  }

  const reqBody = operation.requestBody;
  if (reqBody?.content) {
    const ct = Object.keys(reqBody.content)[0];
    if (ct) {
      curlLines.push(`  -H 'Content-Type: ${ct}'`);
      const bodySchema = reqBody.content[ct]?.schema;
      if (bodySchema) {
        const ex = buildExample(bodySchema, spec);
        if (ex) curlLines.push(`  -d '${JSON.stringify(ex, null, 2)}'`);
      }
    }
  }

  const curlSnippet = curlLines.join(" \\\n");

  const responseContent = displayStatus
    ? operation.responses?.[displayStatus]?.content
    : undefined;
  const firstResponseCt = responseContent ? Object.keys(responseContent)[0] : undefined;
  const responseSchema = firstResponseCt ? responseContent?.[firstResponseCt]?.schema : undefined;
  const responseExample = responseSchema ? buildExample(responseSchema, spec) : null;

  return (
    <div className={styles.rightPanel}>
      {/* Request snippet */}
      <div className={styles.rpCard}>
        <div className={styles.rpCardHeader}>
          <span className={`${styles.methodBadge} ${methodColor(method)}`}>
            {method.toUpperCase()}
          </span>
          <span className={styles.rpPath}>{path}</span>
        </div>
        <CodeBlock code={curlSnippet} language="bash" />
      </div>

      {/* Response codes */}
      {statusCodes.length > 0 && (
        <div className={styles.rpCard}>
          <div className={styles.statusTabs}>
            {statusCodes.map(code => (
              <button
                key={code}
                className={`${styles.statusTab} ${displayStatus === code ? styles.statusTabActive : ""} ${statusColor(code)}`}
                onClick={() => setActiveStatus(code)}
              >
                {code}
              </button>
            ))}
          </div>
          {displayStatus && (
            <div className={styles.responseDesc}>
              {operation.responses?.[displayStatus]?.description}
            </div>
          )}
          {responseExample && (
            <CodeBlock code={JSON.stringify(responseExample, null, 2)} language="json" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Single endpoint ──────────────────────────────────────────────────────────

function EndpointSection({ entry, spec, server }: {
  entry: EndpointEntry;
  spec: OpenAPISpec;
  server: string;
}) {
  const { method, path, operation } = entry;
  const [reqTab, setReqTab] = useState<"schema" | "example">("schema");

  const params = operation.parameters ?? [];
  const pathParams = params.filter(p => p.in === "path");
  const queryParams = params.filter(p => p.in === "query");
  const reqBody = operation.requestBody;
  const reqBodySchema = reqBody?.content
    ? Object.values(reqBody.content)[0]?.schema
    : undefined;

  return (
    <div className={styles.endpoint} id={`${method}-${path.replace(/\//g, "-").replace(/[{}]/g, "")}`}>
      <div className={styles.endpointInner}>
        {/* Left column */}
        <div className={styles.leftCol}>
          <div className={styles.endpointMeta}>
            <span className={`${styles.methodBadge} ${methodColor(method)}`}>
              {method.toUpperCase()}
            </span>
            <code className={styles.endpointPath}>{path}</code>
          </div>

          {operation.summary && (
            <h2 className={styles.endpointTitle}>{operation.summary}</h2>
          )}

          {operation.description && (
            <p className={styles.endpointDesc}>{operation.description}</p>
          )}

          {/* Path params */}
          {pathParams.length > 0 && (
            <div className={styles.paramsSection}>
              <h3 className={styles.sectionLabel}>Path Parameters</h3>
              <div className={styles.schemaPanel}>
                {pathParams.map(p => (
                  <div key={p.name} className={styles.schemaRow}>
                    <div className={styles.schemaHeader}>
                      <span className={styles.propName}>{p.name}</span>
                      <span className={styles.propType}>{schemaTypeName(p.schema, spec)}</span>
                      {p.required && <span className={styles.propRequired}>required</span>}
                    </div>
                    {p.description && <div className={styles.propDesc}>{p.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query params */}
          {queryParams.length > 0 && (
            <div className={styles.paramsSection}>
              <h3 className={styles.sectionLabel}>Query Parameters</h3>
              <div className={styles.schemaPanel}>
                {queryParams.map(p => (
                  <div key={p.name} className={styles.schemaRow}>
                    <div className={styles.schemaHeader}>
                      <span className={styles.propName}>{p.name}</span>
                      <span className={styles.propType}>{schemaTypeName(p.schema, spec)}</span>
                      {p.required && <span className={styles.propRequired}>required</span>}
                    </div>
                    {p.description && <div className={styles.propDesc}>{p.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request body */}
          {reqBody && reqBodySchema && (
            <div className={styles.paramsSection}>
              <div className={styles.sectionLabelRow}>
                <h3 className={styles.sectionLabel}>Request Body</h3>
                <div className={styles.tabRow}>
                  <button
                    className={`${styles.tab} ${reqTab === "schema" ? styles.tabActive : ""}`}
                    onClick={() => setReqTab("schema")}
                  >Schema</button>
                  <button
                    className={`${styles.tab} ${reqTab === "example" ? styles.tabActive : ""}`}
                    onClick={() => setReqTab("example")}
                  >Example</button>
                </div>
              </div>
              {reqTab === "schema"
                ? <SchemaPanel schema={reqBodySchema} spec={spec} />
                : <CodeBlock
                    code={JSON.stringify(buildExample(reqBodySchema, spec), null, 2)}
                    language="json"
                  />
              }
            </div>
          )}

          {/* Responses */}
          {operation.responses && (
            <div className={styles.paramsSection}>
              <h3 className={styles.sectionLabel}>Responses</h3>
              {Object.entries(operation.responses).map(([code, resp]) => {
                const ct = resp.content ? Object.keys(resp.content)[0] : undefined;
                const schema = ct ? resp.content?.[ct]?.schema : undefined;
                return (
                  <div key={code} className={styles.responseRow}>
                    <div className={styles.responseRowHeader}>
                      <span className={`${styles.statusBadge} ${statusColor(code)}`}>{code}</span>
                      <span className={styles.responseRowDesc}>{resp.description}</span>
                      {ct && <span className={styles.contentType}>{ct}</span>}
                    </div>
                    {schema && <SchemaPanel schema={schema} spec={spec} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <RightPanel method={method} path={path} operation={operation} spec={spec} server={server} />
        </div>
      </div>
    </div>
  );
}

// ─── Tag group ───────────────────────────────────────────────────────────────

function TagSection({ tag, desc, endpoints, spec, server, prev, next, onNavigate }: {
  tag: string;
  desc?: string;
  endpoints: EndpointEntry[];
  spec: OpenAPISpec;
  server: string;
  prev: { name: string } | null;
  next: { name: string } | null;
  onNavigate: (tag: string) => void;
}) {
  return (
    <div className={styles.tagSection} id={`tag-${tag}`}>
      <div className={styles.tagHeader}>
        <h1 className={styles.tagTitle}>{tag}</h1>
        {desc && <p className={styles.tagDesc}>{desc}</p>}
      </div>
      {endpoints.map((e, i) => (
        <EndpointSection key={i} entry={e} spec={spec} server={server} />
      ))}
      <div className={styles.pageNav}>
        {prev ? (
          <button className={styles.pageNavBtn} onClick={() => onNavigate(prev.name)}>
            <span className={styles.pageNavDir}>← Previous</span>
            <span className={styles.pageNavLabel}>{prev.name}</span>
          </button>
        ) : <div />}
        {next ? (
          <button className={`${styles.pageNavBtn} ${styles.pageNavBtnRight}`} onClick={() => onNavigate(next.name)}>
            <span className={styles.pageNavDir}>Next →</span>
            <span className={styles.pageNavLabel}>{next.name}</span>
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function ApiSidebar({ tags, endpointsByTag, activeId, activeTag, onSelectTag, onSelectEndpoint }: {
  tags: { name: string; description?: string }[];
  endpointsByTag: Record<string, EndpointEntry[]>;
  activeId: string | null;
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onSelectEndpoint: (id: string) => void;
}) {
  return (
    <nav className={styles.sidebar}>
      {tags.map(tag => (
        <div key={tag.name} className={styles.sidebarGroup}>
          <button
            className={`${styles.sidebarGroupLabel} ${activeTag === tag.name ? styles.sidebarGroupLabelActive : ""}`}
            onClick={() => onSelectTag(tag.name)}
          >
            {tag.name}
          </button>
          {activeTag === tag.name && (endpointsByTag[tag.name] ?? []).map((e, i) => {
            const id = `${e.method}-${e.path.replace(/\//g, "-").replace(/[{}]/g, "")}`;
            return (
              <button
                key={i}
                className={`${styles.sidebarItem} ${activeId === id ? styles.sidebarItemActive : ""}`}
                onClick={() => onSelectEndpoint(id)}
              >
                <span className={styles.sidebarItemLabel}>
                  {e.operation.summary ?? e.path}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApiReferencePage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/docs/openapi.yaml")
      .then(r => r.text())
      .then(text => {
        const parsed = jsYaml.load(text) as OpenAPISpec;
        setSpec(parsed);
      })
      .catch(e => setError(String(e)));
  }, []);

  // Build endpoint list grouped by tag
  const tags = spec?.tags ?? [];
  const endpointsByTag: Record<string, EndpointEntry[]> = {};

  if (spec) {
    for (const [path, item] of Object.entries(spec.paths)) {
      for (const method of ["get", "post", "put", "delete", "patch"] as const) {
        const op = item[method];
        if (!op) continue;
        const tag = op.tags?.[0] ?? "Other";
        if (!endpointsByTag[tag]) endpointsByTag[tag] = [];
        endpointsByTag[tag].push({ method, path, operation: op, tag });
      }
    }
  }

  const visibleTags = tags.filter(t => endpointsByTag[t.name]?.length);

  // Set initial active tag once spec loads
  useEffect(() => {
    if (spec && visibleTags.length && !activeTag) {
      setActiveTag(visibleTags[0].name);
    }
  }, [spec]);

  // Track active endpoint within current tag for sidebar highlighting
  useEffect(() => {
    if (!activeTag) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    document.querySelectorAll("[id^='get-'],[id^='post-'],[id^='put-'],[id^='delete-'],[id^='patch-']")
      .forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTag]);

  const server = spec?.servers?.[0]?.url ?? "";
  const currentTag = visibleTags.find(t => t.name === activeTag) ?? visibleTags[0];
  const currentIdx = visibleTags.findIndex(t => t.name === currentTag?.name);
  const prevTag = currentIdx > 0 ? visibleTags[currentIdx - 1] : null;
  const nextTag = currentIdx < visibleTags.length - 1 ? visibleTags[currentIdx + 1] : null;

  function navigateToTag(tag: string) {
    setActiveTag(tag);
    setActiveId(null);
    window.scrollTo({ top: 0 });
  }

  return (
    <Layout title="API Reference" description="Nyx TEE API Reference">
      <div className={styles.page}>
        {!spec && !error && (
          <div className={styles.loading}>Loading API spec…</div>
        )}
        {error && (
          <div className={styles.loading}>Failed to load spec: {error}</div>
        )}
        {spec && currentTag && (
          <>
            <ApiSidebar
              tags={visibleTags}
              endpointsByTag={endpointsByTag}
              activeId={activeId}
              activeTag={activeTag}
              onSelectTag={navigateToTag}
              onSelectEndpoint={(id) => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveId(id);
              }}
            />
            <main className={styles.main}>
              <TagSection
                key={currentTag.name}
                tag={currentTag.name}
                desc={currentTag.description}
                endpoints={endpointsByTag[currentTag.name] ?? []}
                spec={spec}
                server={server}
                prev={prevTag}
                next={nextTag}
                onNavigate={navigateToTag}
              />
            </main>
          </>
        )}
      </div>
    </Layout>
  );
}
