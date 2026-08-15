import Link from "next/link";

export const metadata = {
  title: "About — Keel",
  description:
    "Learn about Keel's mission to keep project management on course with Vercel, Supabase, and AI workflows.",
};

const APP = "https://app.keel.ostenmark.com";

export default function AboutPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">ABOUT KEEL</span>
          <h1 className="font-satoshi">Project management that keeps its course</h1>
          <p className="inner-page-lede">
            Most project tools ask you to manage the tool as much as the work. Keel is built for modern engineering
            organizations: enough structure to see what is happening, with autonomous AI agents that eliminate busywork.
          </p>
        </div>
      </section>

      {/* 2. Mission & Values Bento Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🎯</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Why Keel exists</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                A keel is the structural backbone running the length of a hull that keeps a ship steady and holds its
                course. Keel was built from the ground up to unify work items, cycles, modules, docs, and AI agents in
                real time without sacrificing reporting capabilities.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🔓</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Open source &amp; Data sovereignty</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Keel is AGPL-3.0 licensed. You can inspect every line of source code, run your own instance with Docker
                or Kubernetes, and deploy in air-gapped environments. A tool that holds your team&apos;s critical
                planning should never hold it hostage.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🤖</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>AI-native from day one</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Keel was not retrofitted for AI; it incorporates native Model Context Protocol (MCP) servers, workspace
                knowledge indexing, and autonomous triage agents so AI can take real assignments and ship real progress.
              </p>
            </div>

            <div
              style={{
                background: "var(--surface-product)",
                border: "1px solid var(--line)",
                borderRadius: "16px",
                padding: "2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem" }}>🏢</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Enterprise ready</h3>
              <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "1.65" }}>
                Certified for SOC 2 Type II, ISO 27001, GDPR, and HIPAA. Offering SAML SSO, Row-Level Security, custom
                SLAs, and dedicated migration tools for moving out of legacy Jira and Linear instances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Global Stats Band (Dark Section #0F0F10) */}
      <section className="section-pad section-dark">
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 700,
                  color: "var(--accent-brand-bright)",
                  fontFamily: "var(--mono)",
                }}
              >
                30,000+
              </div>
              <div style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                GitHub Stars &amp; Community
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 700,
                  color: "var(--accent-brand-bright)",
                  fontFamily: "var(--mono)",
                }}
              >
                100,000+
              </div>
              <div style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                Self-hosted Instances Deployed
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 700,
                  color: "var(--accent-brand-bright)",
                  fontFamily: "var(--mono)",
                }}
              >
                99.99%
              </div>
              <div style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                Guaranteed Cloud Uptime SLA
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 700,
                  color: "var(--accent-brand-bright)",
                  fontFamily: "var(--mono)",
                }}
              >
                Fortune 10
              </div>
              <div style={{ color: "var(--fg-dark-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                Enterprise Migrations Completed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pre-Footer CTA */}
      <section className="cta-band-section">
        <div className="shell">
          <h2 className="font-satoshi">Join thousands of teams shipping faster with Keel</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Get started free
            </a>
            <Link className="btn btn-secondary btn-lg" href="/contact">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
