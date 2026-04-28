"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "../../components/AppShell"
import { getSessionAuthority } from "../../components/auth"
import { apiService } from "../../components/apiService"

export default function Dashboard() {
  const [authority, setAuthority] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalMedia: 0, totalDetections: 0, totalLeakage: 0 })
  const [dbHealth, setDbHealth] = useState(null)

  useEffect(() => {
    setAuthority(getSessionAuthority())
  }, [])

  useEffect(() => {
    if (!authority?.authority_id) return
    setLoading(true)
    apiService
      .listMedia(authority.authority_id)
      .then((items) => setMedia(items))
      .finally(() => setLoading(false))
  }, [authority])

  useEffect(() => {
    if (!media.length) {
      setStats({ totalMedia: 0, totalDetections: 0, totalLeakage: 0 })
      return
    }
    Promise.all(media.map((m) => apiService.getSummary(m.media_id)))
      .then((summaries) => {
        setStats({
          totalMedia: media.length,
          totalDetections: summaries.reduce((acc, s) => acc + (s.total_detections || 0), 0),
          totalLeakage: summaries.reduce((acc, s) => acc + (s.total_leakage || 0), 0),
        })
      })
      .catch(() => {
        setStats({ totalMedia: media.length, totalDetections: 0, totalLeakage: 0 })
      })
  }, [media])

  useEffect(() => {
    apiService.getDbHealth().then(setDbHealth).catch(() => setDbHealth(null))
  }, [])

  return (
    <AppShell>
      <h1 className="title">Dashboard</h1>
      <p className="subtitle">Personalized rights monitoring for your authority.</p>

      <section className="section">
        <div className="row">
          <span className="badge">{authority?.name || "Authority"} ({authority?.authority_id || ""})</span>
          <span className="badge">
            DB: {dbHealth?.ok ? "Connected" : "Unavailable"}
          </span>
          <Link href="/upload-official" className="button">
            Upload Official Media
          </Link>
        </div>
      </section>

      <section className="section grid-3">
        <div className="card">
          <div className="metric-title">Total Official Media</div>
          <div className="metric-value">{stats.totalMedia}</div>
        </div>
        <div className="card">
          <div className="metric-title">Total Detections</div>
          <div className="metric-value">{stats.totalDetections}</div>
        </div>
        <div className="card">
          <div className="metric-title">Total Leakage Views</div>
          <div className="metric-value">{stats.totalLeakage}</div>
        </div>
      </section>

      <section className="section card">
        <h2 style={{ marginTop: 0 }}>Official Media Library</h2>
        {loading && <p>Loading media...</p>}
        {!loading && (
          <div className="list">
            {media.map((m) => (
              <div className="media-item" key={m.media_id}>
                <div>
                  <strong>{m.title}</strong>
                  <div style={{ color: "#5a6785", marginTop: 4 }}>Media ID: {m.media_id}</div>
                </div>
                <span className="badge">Frames: {m.frames?.length || 0}</span>
                <span className="badge">Watermark: {m.watermark_id.slice(0, 8)}...</span>
                <Link href={`/media/${m.media_id}`} className="button">
                  Open Analytics
                </Link>
              </div>
            ))}
            {!media.length && <p>No official media available.</p>}
          </div>
        )}
      </section>
    </AppShell>
  )
}
