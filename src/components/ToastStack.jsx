import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

/**
 * @typedef {{ id: string, message: string, variant: 'success' | 'error' | 'info' }} Toast
 */

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, variant = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
              t.variant === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-50'
                : t.variant === 'error'
                  ? 'border-rose-500/40 bg-rose-950/90 text-rose-50'
                  : 'border-slate-600 bg-slate-900/95 text-slate-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** @returns {(message: string, variant?: 'success' | 'error' | 'info') => void} */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
