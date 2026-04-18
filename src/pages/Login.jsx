import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getIsLoggedIn, setIsLoggedIn } from '../interfaces/auth.js'

const VALID_USER = { username: 'admin', password: '1234' }

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (getIsLoggedIn()) {
    return <Navigate to="/home" replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (username === VALID_USER.username && password === VALID_USER.password) {
      setIsLoggedIn(true)
      navigate('/home', { replace: true })
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Student Task Manager</p>
        </div>

        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-username" className="text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="admin"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••"
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-sm text-rose-200"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-1 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
