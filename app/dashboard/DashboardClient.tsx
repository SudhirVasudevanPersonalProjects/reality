'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-bold">Reality</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
        <h1 className="text-5xl font-bold tracking-wide">my reality</h1>
      </main>
    </div>
  )
}
