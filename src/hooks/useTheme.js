import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

const themes = {
  blue: {
    name: 'Bleu',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    accent: '#1D4ED8',
    gradient: 'from-blue-500 to-blue-600',
    light: '#EFF6FF',
    ultraLight: '#DBEAFE',
    darkLight: '#1E3A8A'
  },
  green: {
    name: 'Vert',
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    accent: '#047857',
    gradient: 'from-green-500 to-green-600',
    light: '#ECFDF5',
    ultraLight: '#D1FAE5',
    darkLight: '#064E3B'
  },
  pink: {
    name: 'Rose',
    primary: '#EC4899',
    primaryDark: '#DB2777',
    primaryLight: '#F472B6',
    accent: '#BE185D',
    gradient: 'from-pink-500 to-pink-600',
    light: '#FDF2F8',
    ultraLight: '#FCE7F3',
    darkLight: '#831843'
  },
  orange: {
    name: 'Orange',
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FBBF24',
    accent: '#B45309',
    gradient: 'from-orange-500 to-orange-600',
    light: '#FFFBEB',
    ultraLight: '#FEF3C7',
    darkLight: '#92400E'
  },
  purple: {
    name: 'Violet',
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    primaryLight: '#A78BFA',
    accent: '#6D28D9',
    gradient: 'from-purple-500 to-purple-600',
    light: '#FAF5FF',
    ultraLight: '#EDE9FE',
    darkLight: '#581C87'
  },
  teal: {
    name: 'Sarcelle',
    primary: '#14B8A6',
    primaryDark: '#0F766E',
    primaryLight: '#2DD4BF',
    accent: '#0D9488',
    gradient: 'from-teal-500 to-teal-600',
    light: '#F0FDFA',
    ultraLight: '#CCFBF1',
    darkLight: '#134E4A'
  }
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useLocalStorage('freetime_theme', 'blue')
  const [forceUpdate, setForceUpdate] = useState(0)
  
  const updateTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
      // Force une mise à jour de tous les composants qui utilisent ce hook
      setForceUpdate(prev => prev + 1)
    }
  }

  const getTheme = () => themes[currentTheme] || themes.blue

  const getThemeClass = (baseClass) => {
    const themeMap = {
      'bg-blue-500': `bg-${currentTheme}-500`,
      'text-blue-500': `text-${currentTheme}-500`,
      'text-blue-600': `text-${currentTheme}-600`,
      'text-blue-700': `text-${currentTheme}-700`,
      'border-blue-500': `border-${currentTheme}-500`,
      'ring-blue-500': `ring-${currentTheme}-500`,
      'focus:ring-blue-500': `focus:ring-${currentTheme}-500`,
      'hover:bg-blue-600': `hover:bg-${currentTheme}-600`,
      'bg-blue-50': `bg-${currentTheme}-50`,
      'bg-blue-100': `bg-${currentTheme}-100`,
      'bg-blue-600': `bg-${currentTheme}-600`,
      'from-blue-500': `from-${currentTheme}-500`,
      'to-blue-600': `to-${currentTheme}-600`
    }
    
    return themeMap[baseClass] || baseClass
  }

  // Appliquer les variables CSS personnalisées
  useEffect(() => {
    const theme = getTheme()
    const root = document.documentElement
    
    // Forcer la mise à jour de toutes les variables CSS
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-primary-dark', theme.primaryDark)
    root.style.setProperty('--color-primary-light', theme.primaryLight)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-light', theme.light)
    root.style.setProperty('--color-ultra-light', theme.ultraLight)
    root.style.setProperty('--color-dark-light', theme.darkLight)
    
    // Déclencher un reflow pour forcer la mise à jour
    document.body.offsetHeight
  }, [currentTheme])

  return {
    currentTheme,
    themes,
    updateTheme,
    getTheme,
    getThemeClass,
    forceUpdate // Exposer forceUpdate pour déclencher des re-renders
  }
}
