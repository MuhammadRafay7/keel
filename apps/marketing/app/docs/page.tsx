export const metadata = { title: "Documentation" };

export default function Page() {
  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="label">Documentation</p>
          <h1>Documentation</h1>
        </div>
      </section>
      <section className="doc">
        <div className="shell">
          <div className="prose">
            <div className="notice">
              <p>
                <strong>Documentation is still being written.</strong> Keel is young and its docs are incomplete. The
                most reliable reference right now is the source and the docs folder in the repository.
              </p>
            </div>
            <h2>Start here</h2>
            <ul>
              <li>
                <a href="https://github.com/MuhammadRafay7/keel">The repository</a> &mdash; source, issues, releases
              </li>
              <li>
                <a href="https://github.com/MuhammadRafay7/keel/blob/main/README.md">README</a> &mdash; what Keel is and
                how to run it locally
              </li>
              <li>
                <a href="https://github.com/MuhammadRafay7/keel/blob/main/docs/architecture.md">Architecture</a> &mdash;
                how the pieces fit together
              </li>
            </ul>
            <h2>Concepts</h2>
            <h3>Work items</h3>
            <p>
              The unit everything hangs off. An item carries state, priority, assignees, labels, estimates and dates,
              nests into sub-items, and links to others as blocking, duplicate or related.
            </p>
            <h3>Cycles</h3>
            <p>
              Time-boxed periods, the equivalent of sprints, with a start and end date and burn-down as work completes.
            </p>
            <h3>Modules</h3>
            <p>Durable groupings that cut across cycles, for splitting a large project into shippable pieces.</p>
            <h3>Views</h3>
            <p>A saved combination of filters, grouping and layout, private to you or shared with the project.</p>
            <h3>Pages</h3>
            <p>Collaborative rich-text documents. Several people can edit the same page at once.</p>
            <h3>Intake</h3>
            <p>
              A triage inbox. Requests land here first and are accepted, declined, snoozed or merged before reaching the
              backlog.
            </p>
            <h2>Layouts</h2>
            <p>
              Work items render as list, board, calendar, spreadsheet or timeline. Any layout can be grouped and
              filtered by any property, and saved as a view.
            </p>
            <h2>Running your own copy</h2>
            <p>
              Keel is AGPL-licensed, so you can host it yourself. Requirements and setup are in the{" "}
              <a href="https://github.com/MuhammadRafay7/keel/blob/main/README.md">README</a>. If you modify Keel and
              serve it over a network, AGPL &sect;13 obliges you to offer your users the source of your version.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
