import { Sidebar } from "@/components/sidebar"

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Players</h1>
          <p className="text-muted-foreground">Full player database coming soon</p>
        </div>
      </main>
    </div>
  )
}
