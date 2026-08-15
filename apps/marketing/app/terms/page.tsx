export const metadata = { title: "Terms of service" };

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Legal</p>
          <h1>Terms of service</h1>
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
            <h2>Who we are</h2>
            <p>
              Keel is a project management service operated by Ostenmark at keel.ostenmark.com. The software is open
              source under the GNU Affero General Public License v3.0.
            </p>
            <h2>Using Keel</h2>
            <p>
              You need an account to use Keel. You are responsible for keeping your credentials secure and for activity
              under your account.
            </p>
            <ul>
              <li>Do not use Keel to break the law, or to store content you have no right to store.</li>
              <li>Do not attempt to disrupt the service or reach data belonging to other workspaces.</li>
              <li>Do not resell access to the hosted service without agreement.</li>
            </ul>
            <p>Keel is under active development. Features may change and the service may be interrupted.</p>
            <h2>Your content</h2>
            <p>
              Your work items, pages, files and comments remain yours. We store and process them only to run the service
              for you. We do not sell them and we do not use them to train models.
            </p>
            <h2>Running it yourself</h2>
            <p>
              Keel is AGPL-licensed, so you may run your own copy. These terms cover only the hosted service. The
              licence, not these terms, governs the software itself.
            </p>
            <h2>Ending your use</h2>
            <p>
              You may stop using Keel and delete your account at any time. We may suspend an account that breaches these
              terms or endangers the service.
            </p>
            <h2>Warranty and liability</h2>
            <p>
              The hosted service is provided as is, without warranty. To the extent the law allows, Ostenmark is not
              liable for indirect or consequential loss arising from your use of it. Keep your own backups of anything
              you cannot afford to lose.
            </p>
            <h2>Contact</h2>
            <p>
              Questions about these terms: <a href="mailto:hello@ostenmark.com">hello@ostenmark.com</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
