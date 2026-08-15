export const metadata = { title: "Changelog" };

/**
 * Deliberately honest. Keel is mid-migration and a changelog that overstates
 * readiness is worse than no changelog — early users find out either way.
 */
export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Changelog</p>
          <h1>What shipped, and what has not</h1>
          <p className="updated">Keel is early. This page says plainly where it stands.</p>
        </div>
      </section>

      <section className="doc">
        <div className="shell">
          <div className="prose" style={{ maxWidth: "52rem" }}>
            <div className="notice">
              <p>
                <strong>Keel is not usable yet.</strong> You can create an account and sign in, but workspaces and
                projects are still being migrated to the new backend, so there is nothing to work in once you are
                through the door. Follow along here.
              </p>
            </div>

            <div className="entry">
              <div className="when">In progress</div>
              <div>
                <h3>
                  Workspaces and projects <span className="status">Building</span>
                </h3>
                <p>
                  Moving the remaining data services onto the new backend. Until this lands, signing in gets you an
                  empty application.
                </p>
              </div>
            </div>

            <div className="entry">
              <div className="when">15 Aug 2026</div>
              <div>
                <h3>
                  Accounts and sign-in <span className="status done">Shipped</span>
                </h3>
                <ul>
                  <li>Email and password accounts, with sessions that persist</li>
                  <li>Per-user data isolation enforced in the database itself</li>
                  <li>Marketing site, documentation, and this changelog</li>
                </ul>
              </div>
            </div>

            <div className="entry">
              <div className="when">15 Aug 2026</div>
              <div>
                <h3>
                  New foundation <span className="status done">Shipped</span>
                </h3>
                <ul>
                  <li>Whole data model rebuilt on managed PostgreSQL in the EU</li>
                  <li>Row-level security switched on across every table, denying by default</li>
                  <li>Hosting moved so there is no server to patch</li>
                </ul>
              </div>
            </div>

            <h2>What is coming</h2>
            <ul>
              <li>
                <strong>Workspaces and projects</strong> — the next milestone, and the one that makes Keel usable
              </li>
              <li>
                <strong>File attachments</strong> — uploads moving to the new storage layer
              </li>
              <li>
                <strong>Collaborative pages</strong> — real-time multi-person editing, the hardest remaining piece
              </li>
              <li>
                <strong>Analytics</strong> — workspace-wide charts
              </li>
            </ul>

            <p>
              Track the detail on <a href="https://github.com/MuhammadRafay7/keel">GitHub</a>, or{" "}
              <a href="/contact">get in touch</a> if you want to be told when it is ready.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
