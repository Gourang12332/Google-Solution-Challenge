export function getSessionAuthority() {
  if (typeof window === "undefined") {
    return null
  }
  const raw = localStorage.getItem("authority_session")
  return raw ? JSON.parse(raw) : null
}

export function setSessionAuthority(authority) {
  localStorage.setItem("authority_session", JSON.stringify(authority))
}

export function clearSessionAuthority() {
  if (typeof window === "undefined") {
    return
  }
  localStorage.removeItem("authority_session")
}
