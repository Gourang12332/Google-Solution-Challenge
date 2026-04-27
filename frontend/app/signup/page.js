"use client"

import { useState } from "react"
import Link from "next/link"
import AppShell from "../../components/AppShell"
import { setSessionAuthority } from "../../components/auth"
import { apiService } from "../../components/apiService"

export default function SignupPage() {
  const [authorityId, setAuthorityId] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const payload = { authority_id: authorityId.trim(), name: name.trim() }
      const created = await apiService.createAuthority(payload)
      setSessionAuthority(created)
      window.location.href = "/"
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create authority")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell requireAuth={false}>
      <h1 className="title">Create Authority Account</h1>
      <p className="subtitle">Register a new authority to start uploading and monitoring media.</p>
      <form className="card section" style={{ maxWidth: 520 }} onSubmit={onSubmit}>
        <div className="list">
          <input
            className="input"
            placeholder="Authority ID"
            value={authorityId}
            onChange={(e) => setAuthorityId(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Authority Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {error && <div style={{ color: "#c01f34" }}>{error}</div>}
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Sign Up"}
          </button>
          <Link href="/login" style={{ color: "#1b4fe0" }}>
            Already have an authority account
          </Link>
        </div>
      </form>
    </AppShell>
  )
}
