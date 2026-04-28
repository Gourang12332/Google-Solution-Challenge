"use client"

import AppShell from "../../components/AppShell"

export default function ContactPage() {
  return (
    <AppShell requireAuth={false}>
      <h1 className="title">Contact</h1>
      <p className="subtitle">Reach the Sports Rights Guard team for onboarding, product support, or partnerships.</p>

      <section className="section split-callout">
        <div className="card">
          <h3>General Inquiries</h3>
          <p>Email: hello@sportsrightsguard.com</p>
          <p>Phone: +91 00000 00000</p>
        </div>
        <div className="card">
          <h3>Support Hours</h3>
          <p>Monday to Friday</p>
          <p>9:00 AM to 6:00 PM IST</p>
        </div>
      </section>

      <section className="section card">
        <h3 style={{ marginTop: 0 }}>Office</h3>
        <p style={{ marginBottom: 0 }}>
          Sports Rights Guard<br />
          Innovation Hub, Bengaluru, Karnataka, India
        </p>
      </section>
    </AppShell>
  )
}
