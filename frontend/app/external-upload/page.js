"use client"

import { useState } from "react"
import AppShell from "../../components/AppShell"
import { apiService } from "../../components/apiService"

export default function ExternalUploadPage() {
  const [form, setForm] = useState({
    video_id: "",
    platform: "youtube",
    video_url: "",
    channelId: "",
    channelTitle: "",
    title: "",
    views: 0,
  })
  const [loading, setLoading] = useState(false)
  const [inputMode, setInputMode] = useState("url")
  const [videoFile, setVideoFile] = useState(null)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setResult("")
    setError("")
    try {
      setLoading(true)
      if (inputMode === "file") {
        if (!videoFile) {
          setError("Select a video file")
          return
        }
        const formData = new FormData()
        formData.append("video_id", form.video_id.trim())
        formData.append("platform", form.platform)
        formData.append("channelId", form.channelId.trim())
        formData.append("channelTitle", form.channelTitle.trim())
        formData.append("title", form.title.trim())
        formData.append("views", String(Number(form.views) || 0))
        formData.append("video", videoFile)
        const data = await apiService.ingestExternalVideoFile(formData)
        setResult(`External upload queued: ${data.video_id}`)
      } else {
        const payload = {
          video_id: form.video_id.trim(),
          platform: form.platform,
          video_url: form.video_url.trim(),
          snippet: {
            channelId: form.channelId.trim(),
            channelTitle: form.channelTitle.trim(),
            title: form.title.trim(),
            publishedAt: new Date().toISOString(),
          },
          views: Number(form.views) || 0,
        }
        const data = await apiService.ingestExternalVideo(payload)
        setResult(`External upload queued: ${data.video_id}`)
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "External upload ingest failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell requireAuth={false}>
      <h1 className="title">External Video Upload Ingestion</h1>
      <p className="subtitle">Separate pipeline for third-party platform uploads and monitoring.</p>
      <form className="card section" onSubmit={onSubmit}>
        <div className="row" style={{ marginBottom: 12 }}>
          <button
            className={`button ${inputMode === "url" ? "" : "secondary"}`}
            type="button"
            onClick={() => setInputMode("url")}
          >
            Use Video URL
          </button>
          <button
            className={`button ${inputMode === "file" ? "" : "secondary"}`}
            type="button"
            onClick={() => setInputMode("file")}
          >
            Upload Video File
          </button>
        </div>
        <div className="grid-2">
          <input className="input" placeholder="Video ID" value={form.video_id} onChange={(e) => onChange("video_id", e.target.value)} required />
          <input className="input" placeholder="Platform" value={form.platform} onChange={(e) => onChange("platform", e.target.value)} required />
          {inputMode === "url" ? (
            <input className="input" placeholder="Video URL" value={form.video_url} onChange={(e) => onChange("video_url", e.target.value)} required />
          ) : (
            <input className="input" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required />
          )}
          <input className="input" placeholder="Views" type="number" min="0" value={form.views} onChange={(e) => onChange("views", e.target.value)} />
          <input className="input" placeholder="Channel ID" value={form.channelId} onChange={(e) => onChange("channelId", e.target.value)} />
          <input className="input" placeholder="Channel Title" value={form.channelTitle} onChange={(e) => onChange("channelTitle", e.target.value)} />
          <input className="input" placeholder="Video Title" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="button" type="submit">
          {loading ? "Uploading..." : "Submit Exernal Upload"}
          </button>
          {result && <span style={{ color: "#17603a" }}>{result}</span>}
          {error && <span style={{ color: "#c01f34" }}>{error}</span>}
        </div>
      </form>
    </AppShell>
  )
}
