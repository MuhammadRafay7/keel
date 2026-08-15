export const metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Legal</p>
          <h1>Privacy policy</h1>
          <p className="updated">Last updated 15 August 2026</p>
        </div>
      </section>
      <section className="doc">
        <div className="shell">
          <div className="prose">
            <div className="notice">
              <p>
                <strong>Not yet reviewed by a lawyer.</strong> This describes honestly how Keel currently works, but it
                has not had legal review. Have it checked before relying on it commercially.
              </p>
            </div>
            <h2>What this covers</h2>
            <p>
              What the hosted service at keel.ostenmark.com collects, why, and what happens to it. If you run your own
              copy, none of this applies &mdash; you control your own data.
            </p>
            <h2>What we collect</h2>
            <h3>Account information</h3>
            <p>
              Your email address and password. Passwords are hashed by our authentication provider and never visible to
              us in readable form.
            </p>
            <h3>What you put into Keel</h3>
            <p>
              Work items, comments, pages, attachments, project and workspace names &mdash; whatever you and your team
              create.
            </p>
            <h3>Operational records</h3>
            <p>
              Standard server logs, including IP address and timestamps, kept to run the service and investigate abuse.
            </p>
            <h2>What we do not do</h2>
            <ul>
              <li>We do not sell your data.</li>
              <li>We do not use your content to train machine learning models.</li>
              <li>We run no advertising and share nothing with advertisers.</li>
            </ul>
            <h2>Where it is stored</h2>
            <p>
              Data lives in a managed PostgreSQL database provided by Supabase, hosted in the European Union. Files are
              in Supabase Storage. The application is served by Vercel.
            </p>
            <h2>Who can see it</h2>
            <p>
              Access is enforced in the database itself through row-level security, so a member of one workspace cannot
              read another workspace&rsquo;s data. Staff access production data only when needed to operate or repair
              the service.
            </p>
            <h2>How long we keep it</h2>
            <p>
              Your content is kept while your account is active. Delete your account and we remove your personal data
              and content, except where we must keep records to meet a legal obligation.
            </p>
            <h2>Your rights</h2>
            <p>
              You may ask for a copy of your data, ask us to correct it, or ask us to delete it. Write to{" "}
              <a href="mailto:privacy@ostenmark.com">privacy@ostenmark.com</a> and we will respond within 30 days.
            </p>
            <h2>Cookies</h2>
            <p>
              Keel sets a session cookie so you stay signed in. There are no advertising or third-party tracking
              cookies.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
