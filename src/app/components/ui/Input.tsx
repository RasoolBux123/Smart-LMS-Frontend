import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-2xl border bg-white/80 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${icon ? 'pl-10' : ''} ${className}`}
            style={{
              borderColor: error ? 'var(--danger)' : 'rgba(148, 163, 184, 0.28)',
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input