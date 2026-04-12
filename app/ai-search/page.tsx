import { Sidebar } from "@/components/sidebar"
import { Sparkles } from "lucide-react"

export default function AISearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFB547]/10 mb-6">
            <Sparkles className="w-8 h-8 text-[#FFB547]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">AI Search</h1>
          <p className="text-muted-foreground mb-4">Natural language search for player insights</p>
          <span className="inline-flex px-3 py-1.5 bg-[#FFB547]/20 text-[#FFB547] rounded-lg text-sm font-medium">
            Coming Soon
          </span>
        </div>
      </main>
    </div>
  )
}
