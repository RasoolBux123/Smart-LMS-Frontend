import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  hoverable = false
}: CardProps) {
  return (
    <div
      className={`rounded-[1.5rem] border border-slate-200/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-200 ${hoverable ? 'hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]' : ''} ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))',
        borderColor: 'var(--border)',
      }}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}