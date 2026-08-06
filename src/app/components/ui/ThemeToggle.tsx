'use client'

import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '../../../context/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-secondary hover:bg-primary/10 hover:text-foreground transition"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
        </button>
    )
}