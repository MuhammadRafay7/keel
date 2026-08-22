import Link from "next/link";

export const metadata = {
  title: "Contact — Keel",
  description:
    "Get in touch with the Keel team for workspace inquiries, sales, technical support, or security questions.",
};

const APP = "https://app.keel.ostenmark.com";
const SALES_EMAIL = "sales@ostenmark.com";
const SUPPORT_EMAIL = "support@ostenmark.com";
const SECURITY_EMAIL = "security@ostenmark.com";

export default function ContactPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">GET IN TOUCH</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Talk to our team
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Whether you are looking for workspace onboarding, custom contract quoting, Bring Your Own AI Key
            configuration, or technical support, we are here to help.
          </p>
        </div>
      </section>

      {/* 2. Contact Channels Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
            {/* Sales & Commercial */}
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
              <div style={{ fontSize: "2rem" }}>💼</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Commercial &amp; Sales</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Workspace quotes, custom billing contracts, team migrations, enterprise SSO, and dedicated SLA
                commitments.
              </p>
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="btn btn-brand btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                Talk to sales ({SALES_EMAIL}) &rarr;
              </a>
            </div>

            {/* Technical Support */}
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
              <div style={{ fontSize: "2rem" }}>🛠️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Technical Support</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Questions about workspace configuration, Bring Your Own AI Key setups, webhooks, or API integrations.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                {SUPPORT_EMAIL} &rarr;
              </a>
            </div>

            {/* Security */}
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
              <div style={{ fontSize: "2rem" }}>🛡️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Security &amp; Compliance</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Security assessments, SOC 2 reports, encryption standards, or privacy inquiries.
              </p>
              <a
                href={`mailto:${SECURITY_EMAIL}`}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                {SECURITY_EMAIL} &rarr;
              </a>
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
              Ready to get started?
            </h2>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-brand btn-lg" href={`${APP}/sign-up`}>
                Launch Workspace
              </a>
              <Link className="btn btn-secondary btn-lg" href="/features">
                Explore all features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
