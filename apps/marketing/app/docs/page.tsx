import Link from "next/link";

export const metadata = {
  title: "Documentation — Plane",
  description: "Comprehensive documentation, API references, and self-hosting deployment guides for Plane.",
};

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function DocsPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">DOCUMENTATION</span>
          <h1 className="font-satoshi">Documentation &amp; Developer Guides</h1>
          <p className="inner-page-lede">
            Everything you need to setup your workspace, deploy self-hosted instances on Docker &amp; Kubernetes, build
            integrations with REST APIs &amp; MCP servers, and automate workflows.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem" }}>
            <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              GitHub Repository &rarr;
            </a>
            <a href={`${REPO}/blob/main/README.md`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              Quickstart README
            </a>
            <Link href="/features" className="btn btn-outline btn-sm">
              Features Overview
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Documentation Tracks Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {/* Getting Started */}
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>🚀</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Getting Started</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Learn the core mental models of Plane: Workspaces, Projects, Work Items, and Members.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Workspace Creation &amp; Setup &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Team Invitations &amp; Role Access &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Creating Your First Project &rarr;
                  </a>
                </li>
              </ul>
            </div>

            {/* Self-Hosting & Prime CLI */}
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>🐳</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Self-Hosting &amp; Deployment</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Run Plane on your own infrastructure with Docker Compose or Kubernetes Helm charts.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Docker Compose Quickstart &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Kubernetes Helm Chart Production &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/README.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Air-gapped &amp; On-prem Setup &rarr;
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers & MCP */}
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>⚡️</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Developers &amp; AI Agents</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Build integrations, automate tasks, and connect AI assistants via Model Context Protocol (MCP).
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <li>
                  <a href={`${REPO}/blob/main/docs/architecture.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • REST API &amp; Webhooks Reference &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/docs/architecture.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Model Context Protocol (MCP) Server &rarr;
                  </a>
                </li>
                <li>
                  <a href={`${REPO}/blob/main/docs/architecture.md`} style={{ color: "var(--accent-brand-bright)" }}>
                    • Plane Compose YAML Specification &rarr;
                  </a>
                </li>
              </ul>
            </div>

            {/* Enterprise & Security */}
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>🛡️</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Enterprise &amp; Compliance</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Configure SAML SSO, Row-Level Security, God Mode administration, and audit logs.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <li>
                  <Link href="/contact" style={{ color: "var(--accent-brand-bright)" }}>
                    • SAML 2.0 &amp; OIDC Single Sign-On &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/contact" style={{ color: "var(--accent-brand-bright)" }}>
                    • God Mode Admin Configuration &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/contact" style={{ color: "var(--accent-brand-bright)" }}>
                    • SOC 2 &amp; ISO 27001 Compliance Reports &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pre-Footer CTA */}
      <section className="cta-band-section">
        <div className="shell">
          <h2 className="font-satoshi">Start building with Plane today</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Create free account
            </a>
            <a className="btn btn-secondary btn-lg" href={REPO}>
              Explore source on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
