import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useAuth } from './useAuth'
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { 
  addSession, 
  getUserSessions, 
  addClient, 
  getUserClients, 
  addProject, 
  getUserProjects,
  saveUserSettings,
  getUserSettings,
  subscribeToUserSessions,
  subscribeToUserClients,
  subscribeToUserProjects
} from '../services/firestore'

export function useTimer() {
  const { currentUser } = useAuth()
  
  // États locaux (localStorage)
  const [localSessions, setLocalSessions] = useLocalStorage('freetime_sessions', [])
  const [localClients, setLocalClients] = useLocalStorage('freetime_clients', ['Client par défaut'])
  const [localProjects, setLocalProjects] = useLocalStorage('freetime_projects', ['Projet par défaut'])
  const [localDailyGoal, setLocalDailyGoal] = useLocalStorage('freetime_daily_goal', 8)
  
  // États Firestore
  const [firestoreSessions, setFirestoreSessions] = useState([])
  const [firestoreClients, setFirestoreClients] = useState(['Client par défaut'])
  const [firestoreProjects, setFirestoreProjects] = useState(['Projet par défaut'])
  const [firestoreDailyGoal, setFirestoreDailyGoal] = useState(8)
  
  // États actuels (basculement automatique selon l'authentification)
  const sessions = currentUser ? firestoreSessions : localSessions
  const clients = currentUser ? firestoreClients : localClients
  const projects = currentUser ? firestoreProjects : localProjects
  const dailyGoal = currentUser ? firestoreDailyGoal : localDailyGoal
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState('00:00:00')
  const [currentSession, setCurrentSession] = useState({
    task: '',
    client: 'Client par défaut',
    project: 'Projet par défaut',
    startTime: null,
    duration: 0
  })

  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const unsubscribeRefs = useRef([])

  // Effect pour gérer la connexion/déconnexion utilisateur et les listeners Firestore
  useEffect(() => {
    if (currentUser) {
      // Utilisateur connecté - charger les données Firestore et setup listeners
      const loadUserData = async () => {
        try {
          // Charger les paramètres
          const settings = await getUserSettings(currentUser.uid)
          if (settings?.dailyGoal) {
            setFirestoreDailyGoal(settings.dailyGoal)
          }
        } catch (error) {
          console.error('Erreur chargement paramètres:', error)
        }
      }

      loadUserData()

      // Setup listeners temps réel
      const unsubscribeSessions = subscribeToUserSessions(currentUser.uid, (sessions) => {
        setFirestoreSessions(sessions)
      })

      const unsubscribeClients = subscribeToUserClients(currentUser.uid, (clients) => {
        const clientNames = clients.map(client => client.name)
        setFirestoreClients(clientNames.length > 0 ? clientNames : ['Client par défaut'])
      })

      const unsubscribeProjects = subscribeToUserProjects(currentUser.uid, (projects) => {
        const projectNames = projects.map(project => project.name)
        setFirestoreProjects(projectNames.length > 0 ? projectNames : ['Projet par défaut'])
      })

      // Stocker les unsubscribe functions
      unsubscribeRefs.current = [unsubscribeSessions, unsubscribeClients, unsubscribeProjects]
    } else {
      // Utilisateur déconnecté - nettoyer les listeners
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe?.())
      unsubscribeRefs.current = []
      
      // Reset des états Firestore
      setFirestoreSessions([])
      setFirestoreClients(['Client par défaut'])
      setFirestoreProjects(['Projet par défaut'])
      setFirestoreDailyGoal(8)
    }

    // Cleanup lors du démontage
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe?.())
    }
  }, [currentUser])

  // Formatage du temps
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Démarrer le timer
  const startTimer = (task, client, project) => {
    if (isRunning) return

    const now = new Date()
    startTimeRef.current = now
    
    setCurrentSession({
      task: task || 'Tâche sans nom',
      client: client || 'Client par défaut',
      project: project || 'Projet par défaut',
      startTime: now,
      duration: 0
    })

    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
      setCurrentTime(formatTime(elapsed))
      setCurrentSession(prev => ({ ...prev, duration: elapsed }))
    }, 1000)
  }

  // Reprendre une session existante
  const resumeTimer = (existingSession) => {
    if (isRunning) return

    const now = new Date()
    startTimeRef.current = new Date(now.getTime() - (existingSession.duration * 1000))
    
    setCurrentSession({
      task: existingSession.task,
      client: existingSession.client,
      project: existingSession.project,
      startTime: new Date(existingSession.startTime),
      duration: existingSession.duration,
      resumedSessionId: existingSession.id // Pour savoir quelle session mettre à jour
    })

    setIsRunning(true)
    setCurrentTime(formatTime(existingSession.duration))

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
      setCurrentTime(formatTime(elapsed))
      setCurrentSession(prev => ({ ...prev, duration: elapsed }))
    }, 1000)
  }

  // Arrêter le timer
  const stopTimer = async () => {
    if (!isRunning) return

    clearInterval(intervalRef.current)
    intervalRef.current = null

    const sessionData = {
      task: currentSession.task,
      client: currentSession.client,
      project: currentSession.project,
      startTime: startTimeRef.current,
      endTime: new Date(),
      duration: currentSession.duration,
      date: format(startTimeRef.current, 'yyyy-MM-dd')
    }

    if (currentUser) {
      // Utilisateur connecté - sauvegarder dans Firestore
      try {
        await addSession(currentUser.uid, sessionData)
      } catch (error) {
        console.error('Erreur sauvegarde session:', error)
        // Fallback vers localStorage en cas d'erreur
        const session = {
          id: Date.now().toString(),
          ...sessionData
        }
        setLocalSessions(prev => [session, ...prev])
      }
    } else {
      // Utilisateur déconnecté - sauvegarder dans localStorage
      const session = {
        id: Date.now().toString(),
        ...sessionData
      }
      setLocalSessions(prev => [session, ...prev])
    }
    
    setIsRunning(false)
    setCurrentTime('00:00:00')
    setCurrentSession({
      task: '',
      client: 'Client par défaut',
      project: 'Projet par défaut',
      startTime: null,
      duration: 0
    })
  }

  // Ajouter une session manuellement
  const addManualSession = async (sessionData) => {
    const session = {
      ...sessionData,
      date: format(new Date(sessionData.startTime), 'yyyy-MM-dd')
    }
    
    if (currentUser) {
      // Utilisateur connecté - sauvegarder dans Firestore
      try {
        await addSession(currentUser.uid, session)
      } catch (error) {
        console.error('Erreur sauvegarde session manuelle:', error)
        // Fallback vers localStorage
        const localSession = { id: Date.now().toString(), ...session }
        setLocalSessions(prev => [localSession, ...prev])
      }
    } else {
      // Utilisateur déconnecté - sauvegarder dans localStorage
      const localSession = { id: Date.now().toString(), ...session }
      setLocalSessions(prev => [localSession, ...prev])
    }
  }

  // Supprimer une session
  const deleteSession = async (sessionId) => {
    if (currentUser) {
      // Utilisateur connecté - supprimer de Firestore
      try {
        // Note: Il faudrait ajouter une fonction deleteSession dans firestore.js
        // Pour l'instant, on filtre localement et on laisse les listeners se synchroniser
        console.warn('Suppression Firestore non implémentée encore')
      } catch (error) {
        console.error('Erreur suppression session:', error)
      }
    } else {
      // Utilisateur déconnecté - supprimer de localStorage
      setLocalSessions(prev => prev.filter(session => session.id !== sessionId))
    }
  }

  // Ajouter un client
  const addClientToList = async (clientName) => {
    if (!clients.includes(clientName)) {
      if (currentUser) {
        // Utilisateur connecté - ajouter à Firestore
        try {
          await addClient(currentUser.uid, { name: clientName })
        } catch (error) {
          console.error('Erreur ajout client:', error)
          // Fallback vers localStorage
          setLocalClients(prev => [...prev, clientName])
        }
      } else {
        // Utilisateur déconnecté - ajouter à localStorage
        setLocalClients(prev => [...prev, clientName])
      }
    }
  }

  // Ajouter un projet
  const addProjectToList = async (projectName) => {
    if (!projects.includes(projectName)) {
      if (currentUser) {
        // Utilisateur connecté - ajouter à Firestore
        try {
          await addProject(currentUser.uid, { name: projectName })
        } catch (error) {
          console.error('Erreur ajout projet:', error)
          // Fallback vers localStorage
          setLocalProjects(prev => [...prev, projectName])
        }
      } else {
        // Utilisateur déconnecté - ajouter à localStorage
        setLocalProjects(prev => [...prev, projectName])
      }
    }
  }

  // Supprimer un client
  const deleteClient = (clientName) => {
    setClients(prev => prev.filter(client => client !== clientName))
  }

  // Supprimer un projet
  const deleteProject = (projectName) => {
    setProjects(prev => prev.filter(project => project !== projectName))
  }

  // Modifier un client
  const updateClient = (oldName, newName) => {
    if (newName.trim() && !clients.includes(newName)) {
      setClients(prev => prev.map(client => client === oldName ? newName : client))
      // Mettre à jour les sessions existantes
      setSessions(prev => prev.map(session => 
        session.client === oldName ? { ...session, client: newName } : session
      ))
    }
  }

  // Modifier un projet
  const updateProject = (oldName, newName) => {
    if (newName.trim() && !projects.includes(newName)) {
      setProjects(prev => prev.map(project => project === oldName ? newName : project))
      // Mettre à jour les sessions existantes
      setSessions(prev => prev.map(session => 
        session.project === oldName ? { ...session, project: newName } : session
      ))
    }
  }

  // Obtenir les sessions par période
  const getSessionsByDateRange = (startDate, endDate) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return isWithinInterval(sessionDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      })
    })
  }

  // Obtenir le temps total par période
  const getTotalTimeByDateRange = (startDate, endDate) => {
    const sessionsInRange = getSessionsByDateRange(startDate, endDate)
    return sessionsInRange.reduce((total, session) => total + session.duration, 0)
  }

  // Obtenir les stats par projet
  const getProjectStats = (startDate, endDate) => {
    const sessionsInRange = getSessionsByDateRange(startDate, endDate)
    const projectStats = {}

    sessionsInRange.forEach(session => {
      const key = `${session.client} - ${session.project}`
      if (!projectStats[key]) {
        projectStats[key] = {
          client: session.client,
          project: session.project,
          duration: 0,
          sessions: 0
        }
      }
      projectStats[key].duration += session.duration
      projectStats[key].sessions += 1
    })

    return Object.values(projectStats).sort((a, b) => b.duration - a.duration)
  }

  // Gérer l'objectif quotidien
  const updateDailyGoal = async (hours) => {
    if (currentUser) {
      // Utilisateur connecté - sauvegarder dans Firestore
      try {
        await saveUserSettings(currentUser.uid, { dailyGoal: hours })
        setFirestoreDailyGoal(hours)
      } catch (error) {
        console.error('Erreur sauvegarde objectif quotidien:', error)
        // Fallback vers localStorage
        setLocalDailyGoal(hours)
      }
    } else {
      // Utilisateur déconnecté - sauvegarder dans localStorage
      setLocalDailyGoal(hours)
    }
  }

  // Cleanup à la fermeture
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    // État
    isRunning,
    currentTime,
    currentSession,
    sessions,
    clients,
    projects,
    dailyGoal,
    
    // Actions
    startTimer,
    resumeTimer,
    stopTimer,
    addSession: addManualSession,
    deleteSession,
    addClient: addClientToList,
    addProject: addProjectToList,
    deleteClient,
    deleteProject,
    updateClient,
    updateProject,
    updateDailyGoal,
    
    // Utilitaires
    formatTime,
    getSessionsByDateRange,
    getTotalTimeByDateRange,
    getProjectStats
  }
}
