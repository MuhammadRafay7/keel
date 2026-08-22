export function LogoCloud() {
  return (
    <section aria-label="Engineering Teams" style={{ padding: "3rem 0", borderBottom: "1px solid var(--line)" }}>
      <div className="shell" style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--fg-subtle)",
            margin: "0 0 1.5rem",
          }}
        >
          Built for high-velocity software engineering teams
        </p>

        <div className="logo-grid">
          {[
            "[Frontend Engineering Teams]",
            "[Infrastructure & DevOps]",
            "[Mobile & iOS Teams]",
            "[Core API & Backend]",
            "[AI Platform Teams]",
            "[Security & Platform]",
          ].map((item) => (
            <div
              key={item}
              style={{
                border: "1px dashed var(--line-strong)",
                borderRadius: "12px",
                padding: "0.6rem 1rem",
                fontSize: "0.75rem",
                fontFamily: "var(--mono)",
                color: "var(--fg-muted)",
                background: "var(--surface-glass)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
