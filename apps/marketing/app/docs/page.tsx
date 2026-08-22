import Link from "next/link";

export const metadata = {
  title: "Documentation — Keel",
  description: "Comprehensive documentation, workspace guides, and API integration references for Keel.",
};

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export default function DocsPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">DOCUMENTATION</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Documentation &amp; User Guides
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Everything you need to set up your workspace, configure Bring Your Own AI Key across 7 providers, master 5
            dynamic views, and automate workflows with REST APIs.
          </p>

          <div
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2rem" }}
          >
            <Link href="/features" className="btn btn-brand btn-sm">
              Features Overview &rarr;
            </Link>
            <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary btn-sm">
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* 2. Documentation Tracks Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {/* Workspace Setup */}
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>🚀</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Getting Started</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Learn the core mental models of Keel: Workspaces, Projects, Work Items, Cycles, Modules, and Members.
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
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Workspace Creation &amp; Team Invitations &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Project Creation &amp; Custom States &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Member Roles &amp; Access Controls &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* BYO AI Key Setup */}
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>🔑</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>Bring Your Own AI Key</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Configure your API key for Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, or Groq with zero token
                reseller markup.
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
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Anthropic Claude &amp; OpenAI GPT Key Setup &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Google Gemini, DeepSeek &amp; Groq Integration &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Workspace Agent Panel Configuration &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* 5 Dynamic Views & Saved Filters */}
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>📋</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>5 Views &amp; Saved Filters</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Switch between List, Board, Calendar, Table, and Timeline views, and save custom shareable filter sets.
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
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Configuring List, Board &amp; Table Grids &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Gantt Timelines &amp; Dependency Cascade &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/features" style={{ color: "var(--accent)" }}>
                    • Creating &amp; Sharing Saved View Filters &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* REST API & Webhooks */}
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "1.75rem" }}>⚡️</div>
              <h3 style={{ fontSize: "1.25rem", margin: 0 }}>API &amp; Webhooks</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: 0 }}>
                Integrate workspace events, automate task states, and connect external developer tooling with REST APIs.
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
                  <Link href="/contact" style={{ color: "var(--accent)" }}>
                    • API Authentication Tokens &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/contact" style={{ color: "var(--accent)" }}>
                    • Webhooks &amp; Event Notification Payload &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/contact" style={{ color: "var(--accent)" }}>
                    • Enterprise SAML SSO Configuration &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pre-Footer CTA */}
      <section className="section-pad" style={{ textAlign: "center" }}>
        <div className="shell" style={{ maxWidth: "48rem" }}>
          <div
            style={{
              background: "var(--surface-glass)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--surface-glass-border)",
              borderRadius: "32px",
              padding: "3.5rem 2rem",
              boxShadow: "var(--shadow-glass-lg)",
            }}
          >
            <h2 className="font-heading" style={{ margin: "0 0 1.25rem" }}>
              Start building with Keel
            </h2>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-brand btn-lg" href={`${APP}/sign-up`}>
                Launch Workspace
              </a>
              <a className="btn btn-secondary btn-lg" href={`mailto:${SALES_EMAIL}`}>
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
