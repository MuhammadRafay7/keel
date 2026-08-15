export const metadata = {
  title: "Terms of Service — Plane",
  description: "Plane Terms of Service: Master subscription and hosting terms.",
};

export default function TermsPage() {
  return (
    <>
      <section className="inner-page-head">
        <div className="shell">
          <span className="label-badge">LEGAL &amp; COMPLIANCE</span>
          <h1 className="font-satoshi">Terms of Service</h1>
          <p className="inner-page-lede">
            Last updated: 15 August 2026. Please read these terms carefully before using Plane Cloud or self-hosted
            editions.
          </p>
        </div>
      </section>

      <section className="doc-section">
        <div className="doc-shell">
          <div className="prose">
            <div className="notice-box">
              <p>
                <strong>Open Source License:</strong> Plane software is licensed under the GNU Affero General Public
                License v3.0 (AGPLv3). These terms govern the hosted Plane Cloud service and commercial licenses.
              </p>
            </div>

            <h2>1. Service Overview</h2>
            <p>
              Plane is an open-source, AI-native project management platform operated by Plane Software, Inc. It allows
              teams to plan, track, and ship projects with work items, cycles, modules, documents, and integrated AI
              agents.
            </p>

            <h2>2. Account Registration &amp; Security</h2>
            <p>
              To access Plane, you must register an account with a valid email address. You are responsible for
              maintaining the confidentiality of your login credentials and for all activities that occur under your
              workspace.
            </p>

            <h2>3. Acceptable Use Policy</h2>
            <p>You agree not to use Plane to:</p>
            <ul>
              <li>Violate any applicable national or international laws or regulations.</li>
              <li>Upload malicious code, viruses, or destructive files.</li>
              <li>Attempt unauthorized access to any other workspace or underlying infrastructure.</li>
              <li>Reverse engineer or disrupt the hosted cloud infrastructure.</li>
            </ul>

            <h2>4. Customer Content Ownership</h2>
            <p>
              You retain all intellectual property rights in and to all content, project data, files, and documents that
              you submit to Plane. We do not claim ownership over your data and process it solely to deliver the
              service.
            </p>

            <h2>5. Service Level Commitments &amp; Uptime</h2>
            <p>
              We strive to provide 99.99% availability for Plane Cloud. Scheduled maintenance windows will be announced
              in advance via our status page at <a href="/contact">status</a>.
            </p>

            <h2>6. Termination</h2>
            <p>
              You may terminate your account and export your data at any time through the workspace settings. We reserve
              the right to suspend accounts that materially breach these terms.
            </p>

            <h2>7. Contact</h2>
            <p>
              Questions regarding these Terms of Service should be directed to{" "}
              <a href="mailto:legal@ostenmark.com">legal@ostenmark.com</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
