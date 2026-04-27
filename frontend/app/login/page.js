"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "../../components/AppShell"
import { setSessionAuthority } from "../../components/auth"
import { apiService } from "../../components/apiService"

export default function LoginPage() {
  const [authorities, setAuthorities] = useState([])
  const [authorityId, setAuthorityId] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    apiService.listAuthorities().then((items) => {
      setAuthorities(items)
      if (items.length) {
        setAuthorityId(items[0].authority_id)
      }
    })
  }, [])

  const onLogin = (e) => {
    e.preventDefault()
    const found = authorities.find((a) => a.authority_id === authorityId)
    if (!found || found.name.toLowerCase() !== name.trim().toLowerCase()) {
      setError("Invalid authority credentials")
      return
    }
    setSessionAuthority(found)
    window.location.href = "/"
  }

  return (
    <AppShell requireAuth={false}>
      <h1 className="title">Authority Sign In</h1>
      <p className="subtitle">Login as a registered rights authority.</p>
      <form className="card section" style={{ maxWidth: 520 }} onSubmit={onLogin}>
        <div className="list">
          <select className="select" value={authorityId} onChange={(e) => setAuthorityId(e.target.value)}>
            {authorities.map((a) => (
              <option key={a.authority_id} value={a.authority_id}>
                {a.authority_id}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Authority name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {error && <div style={{ color: "#c01f34" }}>{error}</div>}
          <button className="button" type="submit">
            Sign In
          </button>
          <Link href="/signup" style={{ color: "#1b4fe0" }}>
            Create new authority account
          </Link>
        </div>
      </form>
    </AppShell>
  )
}
