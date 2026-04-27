import "./globals.css"

export const metadata = {
  title: "Sports Media Monitor",
  description: "Unauthorized sports media detection dashboard",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
