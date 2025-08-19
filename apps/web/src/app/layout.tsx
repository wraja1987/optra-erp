import './globals.css'
import '../styles/theme.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from './fonts'
import Header from '../components/Header'
import ThemeToggle from '../components/ThemeToggle'

export const metadata: Metadata = {
  title: 'V5 Ultra ERP',
  description: 'Enterprise ERP with AI Everywhere',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div style={{padding:12, display:'flex', justifyContent:'flex-end'}}>
          <ThemeToggle />
        </div>
        <Header />
        {children}
      </body>
    </html>
  )
}
