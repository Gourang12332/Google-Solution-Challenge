"use client"

import Link from "next/link"
import AppShell from "../components/AppShell"
export default function HomePage() {
  const features = [
    "Automated watermark and fingerprint matching for rights protection.",
    "End-to-end media upload, ingestion, and anomaly analysis workflows.",
    "Unified dashboard for detection events and leakage impact insights.",
  ]

  return (
    <AppShell requireAuth={false}>
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-kicker">Sports Rights Intelligence Platform</p>
            <h1 className="hero-title">Take control of your sports media ecosystem</h1>
            <p className="hero-subtitle">
              Detect unauthorized uploads, track propagation across platforms, and quantify revenue-impacting leakage in one place.
            </p>
            <div className="row">
              <Link href="/signup" className="button">
                Get Started
              </Link>
              <Link href="/about" className="button secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Why teams use Sports Rights Guard</h2>
        <div className="grid-3">
          {features.map((item) => (
            <div className="card feature-card" key={item}>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section split-callout">
        <div className="card">
          <h3>For Rights Authorities</h3>
          <p>Upload your official media library and monitor detections with verifiable watermark and fingerprint evidence.</p>
        </div>
        <div className="card">
          <h3>For Operations Teams</h3>
          <p>Review unauthorized trends, prioritize incidents by leakage volume, and accelerate takedown or response workflows.</p>
        </div>
      </section>

      <section className="section card cta-strip">
        <div>
          <h3 style={{ margin: 0 }}>Ready to monitor and protect your media rights?</h3>
          <p style={{ marginBottom: 0 }}>Create an authority account and start tracking uploads in minutes.</p>
        </div>
        <Link href="/signup" className="button">Create Account</Link>
      </section>
    </AppShell>
  )
}
