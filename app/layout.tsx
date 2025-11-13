import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitHub as a Drive',
  description: 'Manage your GitHub repository like a cloud drive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
