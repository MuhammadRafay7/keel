export const metadata = {
  title: "Privacy Policy — Plane",
  description: "Plane Privacy Policy: How we collect, store, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">LEGAL &amp; PRIVACY</span>
          <h1 className="font-satoshi">Privacy Policy</h1>
          <p className="inner-page-lede">
            Last updated: 15 August 2026. This policy outlines our strict commitments to data protection, privacy, and
            transparency across Plane services.
          </p>
        </div>
      </section>

      <section className="doc-section">
        <div className="doc-shell">
          <div className="prose">
            <div className="notice-box">
              <p>
                <strong>Data Sovereignty Guarantee:</strong> If you self-host Plane on your own infrastructure or deploy
                in an air-gapped environment, 100% of your data remains solely within your control.
              </p>
            </div>

            <h2>1. What We Collect</h2>
            <h3>Account Information</h3>
            <p>
              When you register for Plane Cloud, we collect your name, email address, and authentication credentials.
              Passwords are cryptographically hashed and never accessible in plaintext.
            </p>

            <h3>Customer Content &amp; Work Items</h3>
            <p>
              We process work items, comments, attached files, Wiki pages, and project configurations that you and your
              team create to provide the project management service.
            </p>

            <h3>Operational &amp; Telemetry Data</h3>
            <p>
              We collect minimal operational logs (IP address, browser type, and timestamps) strictly to diagnose system
              health, prevent security incidents, and maintain high service availability.
            </p>

            <h2>2. What We Do NOT Do</h2>
            <ul>
              <li>
                <strong>We do not sell your data:</strong> We have never sold customer data and never will.
              </li>
              <li>
                <strong>We do not use customer data to train public AI models:</strong> Your proprietary codebase and
                workspace documents remain private to your workspace.
              </li>
              <li>
                <strong>No third-party ad tracking:</strong> We do not run third-party advertising trackers.
              </li>
            </ul>

            <h2>3. Security &amp; Storage Architecture</h2>
            <p>
              Plane Cloud is hosted in secure, ISO 27001 and SOC 2 certified data centers located in the European Union.
              All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Row-level security (RLS) is enforced
              strictly at the PostgreSQL database layer to guarantee complete multi-tenant data isolation.
            </p>

            <h2>4. Your Data Rights (GDPR &amp; CCPA)</h2>
            <p>
              Under GDPR, CCPA, and global privacy laws, you possess the right to access, export, rectify, or delete
              your personal data at any time. To request a full data export or deletion, email{" "}
              <a href="mailto:privacy@ostenmark.com">privacy@ostenmark.com</a>.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              For any questions regarding this Privacy Policy or our security practices, contact our Data Protection
              Officer at <a href="mailto:privacy@ostenmark.com">privacy@ostenmark.com</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
