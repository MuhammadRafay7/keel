export function LogoCloud() {
  const logos = [
    { name: "Sony", text: "SONY" },
    { name: "Aramco", text: "aramco" },
    { name: "Dolby", text: "Dolby" },
    { name: "Accenture", text: "accenture" },
    { name: "Amazon", text: "amazon" },
    { name: "Essor", text: "ESSOR" },
    { name: "40AU", text: "40AU" },
    { name: "Hypersonica", text: "HYPERSONICA" },
    { name: "SSI", text: "SSI" },
    { name: "Ruby Labs", text: "ruby labs" },
    { name: "République Française", text: "RÉPUBLIQUE FRANÇAISE" },
    { name: "Gov of Lithuania", text: "LIETUVOS RESPUBLIKA" },
    { name: "Mirador Therapeutics", text: "MIRADOR" },
    { name: "Texelis", text: "TEXELIS" },
    { name: "OptiGRÜN", text: "OPTIGRÜN" },
    { name: "Stark Bank", text: "STARK BANK" },
    { name: "Datum", text: "DATUM" },
    { name: "Power Integrations", text: "POWER INTEGRATIONS" },
  ];

  return (
    <section
      aria-label="Logos"
      className="section-pad"
      style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      id="logos"
    >
      <div className="shell">
        <div className="logo-grid">
          {logos.map((logo) => (
            <div key={logo.name} className="logo-item">
              <span
                style={{
                  fontFamily: "var(--sans)",
                  fontWeight: 700,
                  fontSize: logo.text.length > 14 ? "0.75rem" : "1.1rem",
                  letterSpacing: logo.text === logo.text.toUpperCase() ? "0.12em" : "-0.02em",
                  color: "var(--fg-muted)",
                  textTransform: logo.text === logo.text.toUpperCase() ? "uppercase" : "none",
                  userSelect: "none",
                }}
              >
                {logo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
