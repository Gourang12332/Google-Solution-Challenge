"use client"

import AppShell from "../../components/AppShell"
import Link from "next/link"

export default function AboutPage() {
  const pillars = [
    {
      title: "Rights Protection",
      description:
        "Track unauthorized uploads across channels with watermark and fingerprint-backed evidence.",
    },
    {
      title: "Actionable Analytics",
      description:
        "Prioritize high-impact incidents using leakage and engagement signals from real detection events.",
    },
    {
      title: "Operational Clarity",
      description:
        "Unify media registration, monitoring, and investigation in one simple workflow for teams.",
    },
  ]

  const workflow = [
    "Register official media assets from rights authorities.",
    "Detect suspicious matches through fingerprint and watermark patterns.",
    "Investigate propagation timeline and unauthorized source behavior.",
    "Respond faster using clear metrics on leakage and audience impact.",
  ]

  return (
    <AppShell requireAuth={false}>
      <h1 className="title">About Sports Rights Guard</h1>
      <p className="subtitle">
        Built to help sports organizations detect media misuse quickly, understand impact, and take timely action.
      </p>

      <section className="section grid-3">
        {pillars.map((pillar) => (
          <div className="card feature-card" key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </div>
        ))}
      </section>

      <section className="section split-callout">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>How it works</h3>
          <div className="list">
            {workflow.map((item) => (
              <span className="badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Built for modern sports operations</h3>
          <p>
            Whether you are a league office, club media team, or anti-piracy unit, Sports Rights Guard is designed to
            help your teams move from detection to decision quickly.
          </p>
          <p style={{ marginBottom: 0 }}>
            The product focuses on practical workflows, not vanity metrics, so teams can reduce monitoring overhead
            and focus on high-priority actions.
          </p>
        </div>
      </section>

      <section className="section grid-3">
        <div className="card">
          <div className="metric-title">Detection Coverage</div>
          <div className="metric-value">24/7</div>
        </div>
        <div className="card">
          <div className="metric-title">Workflow Stages</div>
          <div className="metric-value">4</div>
        </div>
        <div className="card">
          <div className="metric-title">Core Detection Signals</div>
          <div className="metric-value">2</div>
        </div>
      </section>

      <section className="section card cta-strip">
        <div>
          <h3 style={{ margin: 0 }}>Want to explore the platform?</h3>
          <p style={{ marginBottom: 0 }}>
            Create an account and start monitoring your official media portfolio.
          </p>
        </div>
        <Link href="/signup" className="button">
          Start Now
        </Link>
      </section>
    </AppShell>
  )
}
