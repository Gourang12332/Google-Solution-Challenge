import api from "./api"

export const apiService = {
  listAuthorities: async () => {
    const res = await api.get("/authorities")
    return res.data || []
  },
  createAuthority: async (payload) => {
    const res = await api.post("/authorities", payload)
    return res.data
  },
  listMedia: async (authorityId) => {
    const res = await api.get("/media", { params: { authority_id: authorityId } })
    return res.data || []
  },
  uploadOfficialMedia: async (formData) => {
    const res = await api.post("/upload_official", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },
  ingestExternalVideo: async (payload) => {
    const res = await api.post("/ingest", payload)
    return res.data
  },
  ingestExternalVideoFile: async (formData) => {
    const res = await api.post("/ingest_upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },
  getSummary: async (mediaId) => {
    const res = await api.get(`/summary/${mediaId}`)
    return res.data
  },
  getDetections: async (mediaId) => {
    const res = await api.get(`/detections/${mediaId}`)
    return res.data || []
  },
  getDbHealth: async () => {
    const res = await api.get("/health/db")
    return res.data
  },
}
