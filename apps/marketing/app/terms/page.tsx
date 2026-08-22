export const metadata = {
  title: "Terms of Service — Keel",
  description: "Keel Terms of Service: Master workspace subscription and service terms.",
};

const SALES_EMAIL = "sales@ostenmark.com";
const LEGAL_EMAIL = "legal@ostenmark.com";

export default function TermsPage() {
  return (
    <>
      <section className="inner-page-head">
        <div className="shell" style={{ textAlign: "center", maxWidth: "48rem" }}>
          <span className="label-badge">LEGAL &amp; COMPLIANCE</span>
          <h1 className="font-heading" style={{ margin: "1rem 0" }}>
            Terms of Service
          </h1>
          <p className="inner-page-lede" style={{ margin: "0 auto" }}>
            Last updated: 18 August 2026. Please read these terms carefully before creating or using hosted Keel
            workspaces.
          </p>
        </div>
      </section>

      <section className="doc-section">
        <div className="doc-shell">
          <div className="prose">
            <div className="notice-box">
              <p>
                <strong>Hosted Workspace Terms:</strong> These Master Subscription Terms govern access to and use of
                hosted Keel workspaces and related services provided by Keel.
              </p>
            </div>

            <h2>1. Service Overview</h2>
            <p>
              Keel is a hosted work-management workspace for software engineering teams. It connects work items, 5
              dynamic views (List, Board, Calendar, Table spreadsheet, Timeline Gantt), sprint cycles, roadmap modules,
              collaborative Pages documents, per-project discussion chat, and Bring Your Own AI Key integrations into
              one unified workspace.
            </p>

            <h2>2. Account Registration &amp; Security</h2>
            <p>
              To access Keel, you must register a workspace account with a valid work email address. You are responsible
              for maintaining the confidentiality of your login credentials, Bring Your Own AI Key credentials, and all
              activities that occur under your workspace.
            </p>

            <h2>3. Acceptable Use Policy</h2>
            <p>You agree not to use Keel to:</p>
            <ul>
              <li>Violate any applicable local, national, or international laws or regulations.</li>
              <li>Upload malicious code, viruses, or destructive malware.</li>
              <li>Attempt unauthorized access to any other tenant workspace or underlying infrastructure.</li>
              <li>Interfere with or disrupt the security or performance of the hosted service.</li>
            </ul>

            <h2>4. Customer Data Ownership</h2>
            <p>
              You retain all intellectual property rights in and to all project data, work items, documents, files, and
              code specs that you or your team submit to Keel. We claim zero ownership over your customer content and
              process it solely to deliver the hosted workspace service.
            </p>

            <h2>5. Service Availability &amp; Commitments</h2>
            <p>
              We strive to provide 99.99% operational availability for hosted Keel workspaces. Scheduled maintenance
              windows will be announced in advance to workspace administrators.
            </p>

            <h2>6. Commercial Inquiries &amp; Sales</h2>
            <p>
              Hosted Keel workspaces are quoted per workspace. For custom contracts, enterprise single sign-on, or
              billing inquiries, contact our sales team at <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>.
            </p>

            <h2>7. Contact</h2>
            <p>
              Questions regarding these Terms of Service should be directed to{" "}
              <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
