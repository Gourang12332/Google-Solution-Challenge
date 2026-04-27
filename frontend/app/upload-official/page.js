"use client"

import { useEffect, useState } from "react"
import AppShell from "../../components/AppShell"
import { getSessionAuthority } from "../../components/auth"
import { apiService } from "../../components/apiService"

export default function UploadOfficialPage() {
  const [authority, setAuthority] = useState(null)
  const [title, setTitle] = useState("")
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setAuthority(getSessionAuthority())
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setResult("")
    setError("")
    if (!authority?.authority_id) {
      setError("No active authority session")
      return
    }
    if (!video) {
      setError("Select a video file")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("authority_id", authority.authority_id)
      formData.append("title", title.trim())
      formData.append("video", video)
      const data = await apiService.uploadOfficialMedia(formData)
      setResult(`Official media uploaded: ${data.media_id}`)
      setTitle("")
      setVideo(null)
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <h1 className="title">Upload Official Media</h1>
      <p className="subtitle">Embed watermark and register protected fingerprints for your official content.</p>
      <form className="card section" onSubmit={onSubmit}>
        <div className="grid-2">
          <input
            className="input"
            value={authority?.authority_id || ""}
            readOnly
            placeholder="Authority ID"
          />
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Media Title"
            required
          />
          <input
            className="input"
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Official Media"}
          </button>
          {result && <span style={{ color: "#17603a" }}>{result}</span>}
          {error && <span style={{ color: "#c01f34" }}>{error}</span>}
        </div>
      </form>
    </AppShell>
  )
}
