import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // État local pour stocker la valeur
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erreur lors de la lecture du localStorage pour la clé "${key}":`, error)
      return initialValue
    }
  })

  // Fonction pour mettre à jour la valeur
  const setValue = (value) => {
    try {
      // Permet d'utiliser une fonction pour mettre à jour la valeur
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error)
    }
  }

  // Écouter les changements dans les autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Erreur lors du parsing des données localStorage pour la clé "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
