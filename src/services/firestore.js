import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Collections Firestore
const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  clients: 'clients',
  projects: 'projects',
  settings: 'settings'
}

// ============ UTILISATEURS ============
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Erreur création profil utilisateur:', error)
    throw error
  }
}

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Erreur récupération profil utilisateur:', error)
    throw error
  }
}

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Erreur mise à jour profil utilisateur:', error)
    throw error
  }
}

// ============ SESSIONS ============
export const addSession = async (userId, sessionData) => {
  try {
    console.log('🔍 ADDSESSION CALLED:', { userId, sessionData: { client: sessionData.client, project: sessionData.project, task: sessionData.task } })
    
    const sessionsRef = collection(db, COLLECTIONS.sessions)
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur ajout session:', error)
    throw error
  }
}

export const getUserSessions = async (userId) => {
  try {
    const sessionsRef = collection(db, COLLECTIONS.sessions)
    const q = query(
      sessionsRef, 
      where('userId', '==', userId)
      // orderBy('startTime', 'desc') - Temporairement supprimé en attendant les index
    )
    const querySnap = await getDocs(q)
    
    const sessions = querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Tri manuel par startTime desc
    return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  } catch (error) {
    console.error('Erreur récupération sessions utilisateur:', error)
    throw error
  }
}

export const updateSession = async (sessionId, updates) => {
  try {
    const sessionRef = doc(db, COLLECTIONS.sessions, sessionId)
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Erreur mise à jour session:', error)
    throw error
  }
}

export const deleteSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, COLLECTIONS.sessions, sessionId)
    await deleteDoc(sessionRef)
    return true
  } catch (error) {
    console.error('Erreur suppression session:', error)
    throw error
  }
}

// ============ CLIENTS ============
export const addClient = async (userId, clientData) => {
  try {
    const clientName = typeof clientData === 'string' ? clientData : clientData.name
    console.log('🔍 ADDCLIENT CALLED:', { userId, clientName, stack: new Error().stack })
    
    const clientsRef = collection(db, COLLECTIONS.clients)
    const docRef = await addDoc(clientsRef, {
      name: clientName,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur ajout client:', error)
    throw error
  }
}

export const getUserClients = async (userId) => {
  try {
    const clientsRef = collection(db, COLLECTIONS.clients)
    const q = query(
      clientsRef, 
      where('userId', '==', userId)
      // orderBy('name') - Temporairement supprimé en attendant les index
    )
    const querySnap = await getDocs(q)
    
    return querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erreur récupération clients utilisateur:', error)
    throw error
  }
}

export const updateClient = async (clientId, updates) => {
  try {
    const clientRef = doc(db, COLLECTIONS.clients, clientId)
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Erreur mise à jour client:', error)
    throw error
  }
}

export const deleteClient = async (clientId) => {
  try {
    const clientRef = doc(db, COLLECTIONS.clients, clientId)
    await deleteDoc(clientRef)
    return true
  } catch (error) {
    console.error('Erreur suppression client:', error)
    throw error
  }
}

// ============ PROJETS ============
export const addProject = async (userId, projectData) => {
  try {
    const projectsRef = collection(db, COLLECTIONS.projects)
    const docRef = await addDoc(projectsRef, {
      name: typeof projectData === 'string' ? projectData : projectData.name,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur ajout projet:', error)
    throw error
  }
}

export const getUserProjects = async (userId) => {
  try {
    const projectsRef = collection(db, COLLECTIONS.projects)
    const q = query(
      projectsRef, 
      where('userId', '==', userId)
      // orderBy('name') - Temporairement supprimé en attendant les index
    )
    const querySnap = await getDocs(q)
    
    return querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erreur récupération projets utilisateur:', error)
    throw error
  }
}

export const updateProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, COLLECTIONS.projects, projectId)
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Erreur mise à jour projet:', error)
    throw error
  }
}

export const deleteProject = async (projectId) => {
  try {
    const projectRef = doc(db, COLLECTIONS.projects, projectId)
    await deleteDoc(projectRef)
    return true
  } catch (error) {
    console.error('Erreur suppression projet:', error)
    throw error
  }
}

// ============ PARAMÈTRES ============
export const saveUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    await setDoc(userRef, {
      settings: {
        ...settings,
        updatedAt: new Date()
      }
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Erreur sauvegarde paramètres utilisateur:', error)
    throw error
  }
}

export const getUserSettings = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists() && userSnap.data().settings) {
      return userSnap.data().settings
    }
    return null
  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    throw error
  }
}

// ============ LISTENERS TEMPS RÉEL ============
export const subscribeToUserSessions = (userId, callback) => {
  try {
    const sessionsRef = collection(db, COLLECTIONS.sessions)
    const q = query(
      sessionsRef, 
      where('userId', '==', userId)
      // orderBy('startTime', 'desc') - Temporairement supprimé en attendant les index
    )
    
    return onSnapshot(q, (querySnap) => {
      console.log('🔍 SESSIONS LISTENER - Query result:', querySnap.docs.length, 'documents')
      const sessions = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Tri manuel par startTime desc
      sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      console.log('🔍 SESSIONS LISTENER - Processed sessions:', sessions.length)
      callback(sessions)
    }, (error) => {
      console.error('🔥 SESSIONS LISTENER ERROR:', error)
      callback([]) // Fallback avec array vide
    })
  } catch (error) {
    console.error('🔥 SESSIONS LISTENER SETUP ERROR:', error)
    return () => {} // Return empty unsubscribe function
  }
}

export const subscribeToUserClients = (userId, callback) => {
  try {
    const clientsRef = collection(db, COLLECTIONS.clients)
    const q = query(
      clientsRef, 
      where('userId', '==', userId)
      // orderBy('name') - Temporairement supprimé en attendant les index
    )
  
    return onSnapshot(q, (querySnap) => {
      const clients = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(clients)
    })
  } catch (error) {
    console.error('Erreur abonnement clients utilisateur:', error)
    return () => {} // Return empty unsubscribe function
  }
}

export const subscribeToUserProjects = (userId, callback) => {
  const projectsRef = collection(db, COLLECTIONS.projects)
  const q = query(
    projectsRef, 
    where('userId', '==', userId)
    // orderBy('name') - Temporairement supprimé en attendant les index
  )
  
  return onSnapshot(q, (querySnap) => {
    const projects = querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(projects)
  })
}
