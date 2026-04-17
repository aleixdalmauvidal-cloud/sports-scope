"use client"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface AppShellProps {
  children: React.ReactNode
  breadcrumb?: string
  showLiveBadge?: boolean
}

export function AppShell({ children, breadcrumb = "Rankings", showLiveBadge = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[220px]">
        <Topbar breadcrumb={breadcrumb} showLiveBadge={showLiveBadge} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
