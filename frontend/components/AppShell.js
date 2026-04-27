"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { clearSessionAuthority, getSessionAuthority } from "./auth"

export default function AppShell({ children, requireAuth = true }) {
  const [authority, setAuthority] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = getSessionAuthority()
    setAuthority(session)
    if (requireAuth && !session) {
      window.location.href = "/login"
      return
    }
    setReady(true)
  }, [requireAuth])

  const onLogout = () => {
    clearSessionAuthority()
    window.location.href = "/login"
  }

  if (!ready) {
    return null
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Sports Rights Guard</div>
          <nav className="nav">
            <Link href="/">Dashboard</Link>
            <Link href="/analytics">Analytics</Link>
            <Link href="/upload-official">Upload Official</Link>
            {!authority && <Link href="/login">Login</Link>}
            {!authority && <Link href="/signup">Signup</Link>}
            {authority && <button className="button secondary" onClick={onLogout}>Logout</button>}
          </nav>
        </div>
      </header>
      <div className="container page">
        {authority && (
          <div className="badge" style={{ marginBottom: 14 }}>
            {authority.name} ({authority.authority_id})
          </div>
        )}
        {children}
      </div>
    </>
  )
}
