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
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    )
    const querySnap = await getDocs(q)
    
    return querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
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
export const addClient = async (userId, clientName) => {
  try {
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
      where('userId', '==', userId),
      orderBy('name')
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
export const addProject = async (userId, projectName) => {
  try {
    const projectsRef = collection(db, COLLECTIONS.projects)
    const docRef = await addDoc(projectsRef, {
      name: projectName,
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
      where('userId', '==', userId),
      orderBy('name')
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
    const settingsRef = doc(db, COLLECTIONS.settings, userId)
    await setDoc(settingsRef, {
      ...settings,
      userId,
      updatedAt: new Date()
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error)
    throw error
  }
}

export const getUserSettings = async (userId) => {
  try {
    const settingsRef = doc(db, COLLECTIONS.settings, userId)
    const settingsSnap = await getDoc(settingsRef)
    
    if (settingsSnap.exists()) {
      return settingsSnap.data()
    }
    return null
  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    throw error
  }
}

// ============ LISTENERS TEMPS RÉEL ============
export const subscribeToUserSessions = (userId, callback) => {
  const sessionsRef = collection(db, COLLECTIONS.sessions)
  const q = query(
    sessionsRef, 
    where('userId', '==', userId),
    orderBy('startTime', 'desc')
  )
  
  return onSnapshot(q, (querySnap) => {
    const sessions = querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(sessions)
  })
}

export const subscribeToUserClients = (userId, callback) => {
  const clientsRef = collection(db, COLLECTIONS.clients)
  const q = query(
    clientsRef, 
    where('userId', '==', userId),
    orderBy('name')
  )
  
  return onSnapshot(q, (querySnap) => {
    const clients = querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(clients)
  })
}

export const subscribeToUserProjects = (userId, callback) => {
  const projectsRef = collection(db, COLLECTIONS.projects)
  const q = query(
    projectsRef, 
    where('userId', '==', userId),
    orderBy('name')
  )
  
  return onSnapshot(q, (querySnap) => {
    const projects = querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(projects)
  })
}
