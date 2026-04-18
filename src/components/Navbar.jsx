import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../interfaces/auth.js'

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Student Task Manager
          </p>
          <h1 className="truncate text-lg font-bold text-white sm:text-xl">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-400/50 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
