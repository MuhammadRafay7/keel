import Link from "next/link";

export const metadata = {
  title: "About — Keel",
  description:
    "Learn about Keel's mission: building a fast, hosted work management workspace for software engineering teams.",
};

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";

export default function AboutPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">MISSION &amp; PHILOSOPHY</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Work management that keeps its course
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Keel is built specifically for modern software engineering teams: enough structure to maintain high velocity
            and visibility, without bureaucratic bloat or noisy chrome.
          </p>
        </div>
      </section>

      {/* 2. Core Pillars */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>⚡️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Hosted &amp; Fast Immediately</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                No infrastructure to run, update, or maintain. Keel is hosted, highly responsive, and ready immediately
                so your team can focus on writing code and shipping software.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🔑</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Bring Your Own AI Key</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Keel never resells model usage or marks up token rates. Bring your own key for Anthropic, OpenAI,
                Google, xAI, Mistral, DeepSeek, or Groq directly to your workspace.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--surface-glass-border)",
                borderRadius: "24px",
                padding: "2.25rem",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>⌨️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Built for Engineers</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Keyboard-first interaction with universal <code style={{ color: "var(--accent)" }}>Cmd+K</code> palette,
                quiet chrome aesthetic, dense data density options, and sub-50ms UI transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES MATRIX (NO PRICES, NO FIGURES) */}
      <section className="section-pad" style={{ background: "var(--surface-product)" }}>
        <div className="shell">
          <div className="section-header center">
            <span className="label-badge">WORKSPACE CAPABILITIES</span>
            <h2 className="font-heading">Workspace Tier Capabilities</h2>
            <p style={{ color: "var(--fg-muted)", maxWidth: "36rem", margin: "0.5rem auto 0" }}>
              Quoted per workspace. Contact our sales team for custom contracts, dedicated onboarding, and enterprise
              SLA commitments.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                background: "var(--surface-glass)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: "1px solid var(--surface-glass-border)",
                overflow: "hidden",
                boxShadow: "var(--shadow-glass)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontSize: "0.9375rem", fontWeight: 700 }}>
                    Capability
                  </th>
                  <th
                    style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    Team Workspace
                  </th>
                  <th
                    style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    Business Workspace
                  </th>
                  <th
                    style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    Enterprise Workspace
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Work Items & Sub-tasks", team: "✓ Included", biz: "✓ Included", ent: "✓ Included" },
                  {
                    feature: "5 Dynamic Views (List, Board, Calendar, Table, Timeline)",
                    team: "✓ Included",
                    biz: "✓ Included",
                    ent: "✓ Included",
                  },
                  {
                    feature: "Cycles (Sprint Planning & Burndown)",
                    team: "✓ Included",
                    biz: "✓ Included",
                    ent: "✓ Included",
                  },
                  { feature: "Modules & Roadmap Tracking", team: "✓ Included", biz: "✓ Included", ent: "✓ Included" },
                  { feature: "Pages & Collaborative Docs", team: "✓ Included", biz: "✓ Included", ent: "✓ Included" },
                  {
                    feature: "Bring Your Own AI Key (7 Providers)",
                    team: "✓ Included",
                    biz: "✓ Included",
                    ent: "✓ Included",
                  },
                  {
                    feature: "Saved Filters & Custom View Sets",
                    team: "Basic",
                    biz: "Advanced",
                    ent: "Unlimited Shareable",
                  },
                  {
                    feature: "Custom Workflow States & Gates",
                    team: "Standard",
                    biz: "Custom States",
                    ent: "Advanced Automations",
                  },
                  { feature: "Project Chat & Intake Triage", team: "✓ Included", biz: "✓ Included", ent: "✓ Included" },
                  { feature: "SAML 2.0 / OIDC SSO Integration", team: "—", biz: "Optional", ent: "✓ Included" },
                  {
                    feature: "Role-Based Access Control (RBAC)",
                    team: "Standard Roles",
                    biz: "Custom Roles",
                    ent: "Granular RLS",
                  },
                  {
                    feature: "Dedicated Support & Onboarding SLA",
                    team: "Standard",
                    biz: "Priority",
                    ent: "Dedicated 24/7 SLA",
                  },
                ].map((row, idx) => (
                  <tr key={row.feature} style={{ borderTop: idx > 0 ? "1px solid var(--line)" : "none" }}>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: 600, fontSize: "0.875rem" }}>{row.feature}</td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {row.team}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {row.biz}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--accent)",
                        fontWeight: 600,
                      }}
                    >
                      {row.ent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a href={`mailto:${SALES_EMAIL}`} className="btn btn-brand btn-lg">
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* 4. Pre-Footer CTA */}
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
              Get started with Keel
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem", margin: "0 0 2rem" }}>
              Launch your hosted workspace immediately or contact our sales team for enterprise inquiries.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`${APP}/sign-up`} className="btn btn-brand btn-lg">
                Launch Workspace
              </a>
              <a href={`mailto:${SALES_EMAIL}`} className="btn btn-secondary btn-lg">
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
