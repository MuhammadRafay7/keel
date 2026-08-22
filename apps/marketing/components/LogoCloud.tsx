import React from "react";
import { CodeIcon, ServerIcon, SmartphoneIcon, CpuIcon, SparklesIcon, ShieldCheckIcon } from "@/components/Icons";

const DISCIPLINES = [
  {
    icon: CodeIcon,
    name: "Frontend & UI Teams",
    tech: "React · Next.js · Design Systems",
  },
  {
    icon: ServerIcon,
    name: "Infrastructure & DevOps",
    tech: "CI/CD · Docker · K8s · Terraform",
  },
  {
    icon: SmartphoneIcon,
    name: "Mobile & iOS Teams",
    tech: "Swift · React Native · Expo",
  },
  {
    icon: CpuIcon,
    name: "Core API & Backend",
    tech: "Python · Rust · Microservices",
  },
  {
    icon: SparklesIcon,
    name: "AI Platform Teams",
    tech: "Anthropic · OpenAI · Custom Keys",
  },
  {
    icon: ShieldCheckIcon,
    name: "Security & Platform",
    tech: "SOC2 · RBAC · Audit Logging",
  },
];

export function LogoCloud() {
  return (
    <section aria-label="Engineering Disciplines" className="engineering-trust-section">
      <div className="shell" style={{ textAlign: "center" }}>
        <p className="engineering-trust-heading">Built for high-velocity software engineering teams</p>

        <div className="engineering-discipline-grid">
          {DISCIPLINES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="discipline-card">
                <div className="discipline-card-icon">
                  <Icon size={16} />
                </div>
                <div className="discipline-card-info">
                  <span className="discipline-card-name">{item.name}</span>
                  <span className="discipline-card-tech">{item.tech}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
