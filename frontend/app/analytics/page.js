"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import AppShell from "../../components/AppShell"
import { getSessionAuthority } from "../../components/auth"
import { apiService } from "../../components/apiService"

export default function AnalyticsPage() {
  const [authority, setAuthority] = useState(null)
  const [mediaRows, setMediaRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAuthority(getSessionAuthority())
  }, [])

  useEffect(() => {
    if (!authority?.authority_id) return
    setLoading(true)
    apiService
      .listMedia(authority.authority_id)
      .then(async (media) => {
        const rows = await Promise.all(
          media.map(async (m) => {
            const summary = await apiService.getSummary(m.media_id)
            const detections = await apiService.getDetections(m.media_id)
            const unauthorized = detections.filter((d) => d.status === "unauthorized").length
            return {
              media_id: m.media_id,
              title: m.title,
              total_detections: summary.total_detections || 0,
              total_leakage: summary.total_leakage || 0,
              unauthorized_count: unauthorized,
            }
          })
        )
        setMediaRows(rows)
      })
      .finally(() => setLoading(false))
  }, [authority])

  const aggregate = useMemo(() => {
    return {
      media: mediaRows.length,
      detections: mediaRows.reduce((acc, row) => acc + row.total_detections, 0),
      leakage: mediaRows.reduce((acc, row) => acc + row.total_leakage, 0),
      unauthorized: mediaRows.reduce((acc, row) => acc + row.unauthorized_count, 0),
    }
  }, [mediaRows])

  return (
    <AppShell>
      <h1 className="title">Analytics</h1>
      <p className="subtitle">Detection insights for {authority?.name || "your authority"}.</p>

      <section className="section grid-3">
        <div className="card">
          <div className="metric-title">Media Assets</div>
          <div className="metric-value">{aggregate.media}</div>
        </div>
        <div className="card">
          <div className="metric-title">Detection Events</div>
          <div className="metric-value">{aggregate.detections}</div>
        </div>
        <div className="card">
          <div className="metric-title">Leakage Views</div>
          <div className="metric-value">{aggregate.leakage}</div>
        </div>
      </section>

      <section className="section card">
        <h2 style={{ marginTop: 0 }}>Media Performance Table</h2>
        {loading && <p>Loading analytics...</p>}
        {!loading && (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Total Detections</th>
                <th>Unauthorized Events</th>
                <th>Leakage Views</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mediaRows.map((row) => (
                <tr key={row.media_id}>
                  <td>{row.title}</td>
                  <td>{row.total_detections}</td>
                  <td>{row.unauthorized_count}</td>
                  <td>{row.total_leakage}</td>
                  <td>
                    <Link href={`/media/${row.media_id}`} style={{ color: "#1b4fe0" }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!mediaRows.length && (
                <tr>
                  <td colSpan={5}>No analytics data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </AppShell>
  )
}
