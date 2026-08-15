export const metadata = { title: "About" };

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">About</p>
          <h1>Small tool, serious work</h1>
        </div>
      </section>
      <section className="doc">
        <div className="shell">
          <div className="prose">
            <h2>Why Keel exists</h2>
            <p>
              Most project tools ask you to manage the tool as much as the work. Keel is an attempt at the opposite:
              enough structure to see what is happening, and nothing that needs babysitting.
            </p>
            <h2>What we are building</h2>
            <p>
              A tracker with real documents attached. Work items with proper relationships, cycles that show whether you
              will land, modules that survive longer than a sprint, and pages your team actually writes in &mdash; all
              on top of Postgres.
            </p>
            <h2>Open source</h2>
            <p>
              Keel is AGPL-licensed. You can read every line, run your own copy, and leave whenever you like. That is
              deliberate: a tool that holds your team&rsquo;s planning should not be able to hold it hostage.
            </p>
            <h2>Where it runs</h2>
            <p>
              The hosted service runs on Vercel with a managed Postgres database in the European Union. There is no
              server to patch and no VPS in the loop, which keeps operations small enough for a small team.
            </p>
            <h2>Status</h2>
            <p>
              Keel is young and actively changing. The <a href="/changelog">changelog</a> is the honest picture of what
              works today and what is still being built.
            </p>
            <h2>Get in touch</h2>
            <p>
              <a href="/contact">Contact us</a>, or open an issue on{" "}
              <a href="https://github.com/MuhammadRafay7/keel">GitHub</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
