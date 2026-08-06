'use client'

import { useState } from 'react'
import { FaBars } from 'react-icons/fa'

export default function SidebarToggle() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '72px' : '0px')
  }

  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 p-2.5 bg-card rounded-xl shadow-lg border border-custom hover:bg-primary/5 transition"
      aria-label="Toggle Sidebar"
    >
      <FaBars className="text-xl" />
    </button>
  )
}