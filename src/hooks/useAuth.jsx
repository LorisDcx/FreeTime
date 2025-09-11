import { useState, useEffect, createContext, useContext } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { createUserProfile, getUserProfile } from '../services/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Inscription
  const signup = async (email, password, displayName) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
    
    // Créer le profil utilisateur dans Firestore
    try {
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        settings: {
          dailyGoal: 8,
          theme: 'light'
        }
      })
    } catch (error) {
      console.error('Erreur création profil utilisateur:', error)
    }
    
    return user
  }

  // Connexion
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Déconnexion
  const logout = () => {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
