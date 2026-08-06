'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  FaHome, 
  FaBook, 
  FaTasks, 
  FaFileAlt,
  FaQuestionCircle,
  FaProjectDiagram,
  FaGraduationCap,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaVideo
} from 'react-icons/fa'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!user) return null

  const role = user.role
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  // Menu items based on role - NO DUMMY DATA
  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: FaHome },
      { name: 'Courses', path: '/admin/courses', icon: FaBook },
      { name: 'Users', path: '/admin/users', icon: FaUser },
      { name: 'Analytics', path: '/admin/analytics', icon: FaTasks },
    ],
    instructor: [
      { name: 'Dashboard', path: '/instructor', icon: FaHome },
      { name: 'Courses', path: '/instructor/courses', icon: FaBook },
      { name: 'Assignments', path: '/instructor/assignments', icon: FaFileAlt },
      { name: 'Quizzes', path: '/instructor/quizzes', icon: FaQuestionCircle },
      { name: 'Projects', path: '/instructor/projects', icon: FaProjectDiagram },
      { name: 'Students', path: '/instructor/students', icon: FaGraduationCap },
      { name: 'Gradebook', path: '/instructor/gradebook', icon: FaClipboardList },
    ],
    student: [
      { name: 'Dashboard', path: '/student', icon: FaHome },
      { name: 'My Courses', path: '/student/my-courses', icon: FaBook },
      { name: 'Assignments', path: '/student/assignments', icon: FaFileAlt },
      { name: 'Quizzes', path: '/student/quizzes', icon: FaQuestionCircle },
      { name: 'Projects', path: '/student/projects', icon: FaProjectDiagram },
      { name: 'Grades', path: '/student/grades', icon: FaGraduationCap },
      { name: 'Insights', path: '/student/insights', icon: FaTasks },
    ]
  }

  const items = menuItems[role as keyof typeof menuItems] || []

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-card rounded-xl shadow-lg border border-custom hover:bg-primary/5 transition"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-custom z-40
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-custom">
          <Link href={`/${role}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">SL</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Smart LMS</h1>
              <p className="text-xs text-secondary capitalize">{role}</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-custom">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-secondary truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg transition
                      ${isActive(item.path) 
                        ? 'bg-primary text-white' 
                        : 'text-secondary hover:bg-primary/5 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="text-lg" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-custom space-y-2">
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-foreground transition"
          >
            <FaBell className="text-lg" />
            <span className="text-sm font-medium">Notifications</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}