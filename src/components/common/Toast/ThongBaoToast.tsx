import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import './Toast.css'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number // ms, default 4000
}

interface ToastContextValue {
  success: (title: string, message?: string, duration?: number) => void
  error:   (title: string, message?: string, duration?: number) => void
  warning: (title: string, message?: string, duration?: number) => void
  info:    (title: string, message?: string, duration?: number) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

const TITLES: Record<ToastType, string> = {
  success: 'Thành công',
  error:   'Lỗi',
  warning: 'Cảnh báo',
  info:    'Thông báo',
}

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Slide in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Auto remove
  useEffect(() => {
    const duration = toast.duration ?? 4000
    const timer = setTimeout(() => handleRemove(), duration)
    return () => clearTimeout(timer)
  }, [toast.id])

  const handleRemove = () => {
    setLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      className={`toast-item toast-${toast.type} ${visible ? 'toast-visible' : ''} ${leaving ? 'toast-leaving' : ''}`}
    >
      {/* Progress bar */}
      <div
        className="toast-progress"
        style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
      />

      {/* Icon */}
      <div className={`toast-icon toast-icon-${toast.type}`}>
        {ICONS[toast.type]}
      </div>

      {/* Content */}
      <div className="toast-content">
        <span className="toast-title">{toast.title || TITLES[toast.type]}</span>
        {toast.message && <span className="toast-message">{toast.message}</span>}
      </div>

      {/* Close */}
      <button className="toast-close" onClick={handleRemove} aria-label="Đóng">
        ✕
      </button>
    </div>
  )
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const add = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${++counter.current}-${Date.now()}`
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value: ToastContextValue = {
    success: (title, message, duration) => add('success', title, message, duration),
    error:   (title, message, duration) => add('error',   title, message, duration),
    warning: (title, message, duration) => add('warning', title, message, duration),
    info:    (title, message, duration) => add('info',    title, message, duration),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  )
}
