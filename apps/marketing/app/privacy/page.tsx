export const metadata = {
  title: "Privacy Policy — Keel",
  description: "Keel Privacy Policy: How we collect, store, and protect your workspace data.",
};

const SALES_EMAIL = "sales@ostenmark.com";
const PRIVACY_EMAIL = "privacy@ostenmark.com";

export default function PrivacyPage() {
  return (
    <>
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">LEGAL &amp; PRIVACY</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Privacy Policy
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Last updated: 18 August 2026. This policy outlines our commitments to data protection, security, and privacy
            across hosted Keel services.
          </p>
        </div>
      </section>

      <section className="doc-section">
        <div className="doc-shell">
          <div className="prose">
            <div className="notice-box">
              <p>
                <strong>Bring Your Own AI Key Privacy Guarantee:</strong> When you provide your own API key for
                Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, or Groq, your key and requests route directly to your
                provider. Keel never resells model usage, never trains public models on your customer data, and never
                sells your data.
              </p>
            </div>

            <h2>1. What We Collect</h2>
            <h3>Account &amp; Workspace Credentials</h3>
            <p>
              When you register for a hosted Keel workspace, we collect your name, work email address, and
              authentication credentials. Passwords are cryptographically hashed and never accessible in plaintext.
            </p>

            <h3>Customer Content &amp; Work Items</h3>
            <p>
              We process work items, sub-tasks, comments, attached files, Pages documents, project configurations, and
              saved view filter sets that you and your team create to deliver the workspace service.
            </p>

            <h3>Minimal Operational Logs</h3>
            <p>
              We collect minimal operational logs (IP address, browser type, and timestamps) strictly to diagnose system
              performance, prevent security incidents, and maintain high service availability.
            </p>

            <h2>2. Strict Privacy Commitments</h2>
            <ul>
              <li>
                <strong>We do not sell customer data:</strong> We have never sold customer data and never will.
              </li>
              <li>
                <strong>We do not train public AI models on your data:</strong> Your workspace items, documents, and
                code specs remain strictly private to your workspace.
              </li>
              <li>
                <strong>No third-party ad tracking:</strong> We do not run third-party advertising trackers or sell
                advertising pixels.
              </li>
              <li>
                <strong>Direct AI Provider Key Routing:</strong> Your Bring Your Own AI Key stays strictly encrypted and
                is invoked solely when you or your team request AI assistance.
              </li>
            </ul>

            <h2>3. Security &amp; Storage Architecture</h2>
            <p>
              Hosted Keel workspaces are deployed in secure, ISO 27001 and SOC 2 certified data centers. All data is
              encrypted in transit (TLS 1.3) and at rest (AES-256). Row-level security (RLS) is enforced strictly at the
              database layer to guarantee complete workspace tenant isolation.
            </p>

            <h2>4. Data Rights (GDPR &amp; CCPA)</h2>
            <p>
              Under GDPR, CCPA, and global privacy frameworks, you retain full rights to access, export, rectify, or
              delete your personal and workspace data at any time. To request a full workspace export or deletion, email{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </p>

            <h2>5. Commercial Inquiries &amp; Contact</h2>
            <p>
              For commercial workspace agreements or sales questions, contact{" "}
              <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>. For privacy inquiries, contact our Data Protection
              Officer at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
