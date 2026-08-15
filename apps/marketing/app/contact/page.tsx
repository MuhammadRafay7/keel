import Link from "next/link";

export const metadata = {
  title: "Contact — Keel",
  description:
    "Get in touch with the Keel team for enterprise sales, migration assistance, technical support, or inquiries.",
};

const APP = "https://app.keel.ostenmark.com";
const REPO = "https://github.com/MuhammadRafay7/keel";

export default function ContactPage() {
  return (
    <>
      {/* 1. Page Header */}
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">GET IN TOUCH</span>
          <h1 className="font-satoshi">Talk to our team</h1>
          <p className="inner-page-lede">
            Whether you&apos;re looking for an enterprise demo, assistance with Jira or Linear migration, air-gapped
            deployment, or technical support, we are here to help.
          </p>
        </div>
      </section>

      {/* 2. Contact Channels Grid */}
      <section className="section-pad">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Sales & Enterprise */}
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
              <div style={{ fontSize: "2rem" }}>💼</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Sales &amp; Enterprise</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Custom pricing, dedicated SLA, custom contracts, and air-gapped on-premise onboarding.
              </p>
              <a
                href="mailto:sales@ostenmark.com"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                sales@ostenmark.com &rarr;
              </a>
            </div>

            {/* Technical Support */}
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
              <div style={{ fontSize: "2rem" }}>🛠️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Technical Support</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Questions about workspace configuration, integrations, webhooks, or self-hosting setups.
              </p>
              <a
                href="mailto:support@ostenmark.com"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                support@ostenmark.com &rarr;
              </a>
            </div>

            {/* Security */}
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
              <div style={{ fontSize: "2rem" }}>🛡️</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Security &amp; Compliance</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Responsible vulnerability disclosures, SOC 2 reports, or privacy inquiries.
              </p>
              <a
                href="mailto:security@ostenmark.com"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                security@ostenmark.com &rarr;
              </a>
            </div>

            {/* GitHub Community */}
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
              <div style={{ fontSize: "2rem" }}>💬</div>
              <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Community &amp; Bugs</h3>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
                Open bug reports, submit feature requests, or discuss architecture with contributors on GitHub.
              </p>
              <a
                href={`${REPO}/issues`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
              >
                Open GitHub Issue &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pre-Footer CTA */}
      <section className="cta-band-section">
        <div className="shell">
          <h2 className="font-satoshi">Ready to get started?</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-inverse btn-lg" href={`${APP}/sign-up`}>
              Create your account
            </a>
            <Link className="btn btn-secondary btn-lg" href="/features">
              Explore all features
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
