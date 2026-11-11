import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('joblink_theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('joblink_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark(current => !current)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E9DFD2] bg-white text-[#806C53] transition hover:bg-[#F3EBDD]"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
