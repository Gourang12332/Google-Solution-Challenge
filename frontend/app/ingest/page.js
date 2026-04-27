"use client"

import { useEffect } from "react"

export default function IngestPage() {
  useEffect(() => {
    window.location.replace("/external-upload")
  }, [])

  return null
}
