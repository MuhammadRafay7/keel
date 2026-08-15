export const metadata = { title: "Contact" };

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Contact</p>
          <h1>Get in touch</h1>
        </div>
      </section>
      <section className="doc">
        <div className="shell">
          <div className="prose">
            <h2>Support</h2>
            <p>
              Something broken, or a question about using Keel:{" "}
              <a href="mailto:support@ostenmark.com">support@ostenmark.com</a>
            </p>
            <h2>Security</h2>
            <p>
              Found a vulnerability? Report it privately rather than opening a public issue:{" "}
              <a href="mailto:security@ostenmark.com">security@ostenmark.com</a>
            </p>
            <h2>Privacy</h2>
            <p>
              Data requests and privacy questions: <a href="mailto:privacy@ostenmark.com">privacy@ostenmark.com</a>
            </p>
            <h2>Bugs and feature requests</h2>
            <p>
              Open an issue on <a href="https://github.com/MuhammadRafay7/keel/issues">GitHub</a>. Fastest route for
              anything technical, and other people can find the answer too.
            </p>
            <h2>Everything else</h2>
            <p>
              <a href="mailto:hello@ostenmark.com">hello@ostenmark.com</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
