"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import PropagationGraph from "../../../components/PropagationGraph"
import AppShell from "../../../components/AppShell"
import { apiService } from "../../../components/apiService"

export default function MediaDetailPage({ params }) {
  const mediaId = params.mediaId
  const [summary, setSummary] = useState(null)
  const [detections, setDetections] = useState([])

  useEffect(() => {
    apiService.getSummary(mediaId).then((data) => setSummary(data))
    apiService.getDetections(mediaId).then((items) => setDetections(items))
  }, [mediaId])

  const watermarkCount = useMemo(
    () => detections.filter((d) => d.detection_type === "watermark").length,
    [detections]
  )
  const fingerprintCount = useMemo(
    () => detections.filter((d) => d.detection_type === "fingerprint").length,
    [detections]
  )
  const perSourceViews = useMemo(() => {
    const map = new Map()
    detections.forEach((d) => {
      const key = `${d.source.platform}:${d.source.uploader}`
      map.set(key, (map.get(key) || 0) + (d.views || 0))
    })
    return [...map.entries()].map(([source, views]) => ({ source, views }))
  }, [detections])

  return (
    <AppShell>
      <p style={{ margin: 0 }}>
        <Link href="/analytics" style={{ color: "#1b4fe0" }}>
          Back to Analytics
        </Link>
      </p>
      <h1 className="title">Media Analytics</h1>
      <p className="subtitle">{mediaId}</p>
      <section className="section grid-3">
        <Card title="Total Detections" value={summary?.total_detections ?? 0} />
        <Card title="Watermark Detections" value={watermarkCount} />
        <Card title="Fingerprint Detections" value={fingerprintCount} />
      </section>

      <section className="section">
        <h2>Engagement Leakage</h2>
        <Card title="Total Leakage" value={summary?.total_leakage ?? 0} />
        <div className="list" style={{ marginTop: 10 }}>
          {perSourceViews.map((row) => (
            <div key={row.source} className="card" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{row.source}</span>
              <strong>{row.views} views</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Propagation Timeline</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Platform</th>
                <th>Uploader</th>
                <th>Type</th>
                <th>Status</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
          {[...detections]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((d) => (
              <tr key={d.detection_id}>
                <td>{new Date(d.timestamp).toLocaleString()}</td>
                <td>{d.source.platform}</td>
                <td>{d.source.uploader}</td>
                <td>{d.detection_type}</td>
                <td>{d.status}</td>
                <td>{d.views}</td>
              </tr>
            ))}
            {!detections.length && (
              <tr>
                <td colSpan={6}>No detection events.</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Propagation Graph</h2>
        <PropagationGraph detections={detections} />
      </section>
    </AppShell>
  )
}

function Card({ title, value }) {
  return (
    <div className="card">
      <div style={{ fontSize: 13, color: "#5b6574" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
