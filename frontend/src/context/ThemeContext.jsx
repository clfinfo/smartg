import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'kn' : 'en')

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, language, toggleLanguage }}>
      {children}
    </ThemeContext.Provider>
  )
}
