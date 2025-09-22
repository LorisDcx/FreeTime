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
  subscribeToUserProjects,
  updateSession
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
  console.log('🔍 SESSIONS CURRENT:', { 
    currentUser: !!currentUser, 
    sessionsCount: sessions.length, 
    localSessionsCount: localSessions.length,
    firestoreSessionsCount: firestoreSessions.length 
  })
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
          // Charger les paramètres - temporairement désactivé en attendant résolution permissions
          // const settings = await getUserSettings(currentUser.uid)
          // if (settings?.dailyGoal) {
          //   setFirestoreDailyGoal(settings.dailyGoal)
          // }
          
          // Utiliser valeur par défaut pour l'instant
          setFirestoreDailyGoal(8)
        } catch (error) {
          console.error('Erreur chargement paramètres:', error)
        }
      }

      loadUserData()

      // Setup listeners temps réel
      const unsubscribeSessions = subscribeToUserSessions(currentUser.uid, (sessions) => {
        console.log('🔍 SESSIONS LISTENER RECEIVED:', sessions)
        console.log('🔍 SESSIONS LENGTH:', sessions.length)
        if (sessions.length > 0) {
          console.log('🔍 FIRST SESSION STRUCTURE:', sessions[0])
          console.log('🔍 FIRST SESSION DURATION:', sessions[0].duration, typeof sessions[0].duration)
          console.log('🔍 FIRST SESSION STARTTIME:', sessions[0].startTime, typeof sessions[0].startTime)
        }
        setFirestoreSessions(sessions)
      })

      const unsubscribeClients = subscribeToUserClients(currentUser.uid, (clients) => {
        console.log('🔍 CLIENTS LISTENER RECEIVED:', clients)
        const clientNames = clients.map(client => {
          console.log('🔍 MAPPING CLIENT:', client, 'NAME:', client?.name)
          return client?.name || client
        }).filter(name => typeof name === 'string')
        console.log('🔍 CLIENT NAMES EXTRACTED:', clientNames)
        setFirestoreClients(clientNames.length > 0 ? clientNames : ['Client par défaut'])
      })

      const unsubscribeProjects = subscribeToUserProjects(currentUser.uid, (projects) => {
        const projectNames = projects.map(project => {
          return project?.name || project
        }).filter(name => typeof name === 'string')
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
        if (currentSession.resumedSessionId) {
          // Session reprise - mettre à jour l'existante
          console.log('🔍 UPDATING RESUMED SESSION:', currentSession.resumedSessionId, sessionData)
          await updateSession(currentSession.resumedSessionId, {
            duration: currentSession.duration,
            endTime: new Date(),
            updatedAt: new Date()
          })
          console.log('🔍 SESSION UPDATED:', currentSession.resumedSessionId)
        } else {
          // Nouvelle session - créer
          console.log('🔍 SAVING NEW SESSION TO FIRESTORE:', sessionData)
          const sessionId = await addSession(currentUser.uid, sessionData)
          console.log('🔍 SESSION SAVED WITH ID:', sessionId)
        }
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
      if (currentSession.resumedSessionId) {
        // Session reprise - mettre à jour l'existante
        console.log('🔍 UPDATING RESUMED SESSION IN LOCALSTORAGE:', currentSession.resumedSessionId)
        setLocalSessions(prev => prev.map(session => 
          session.id === currentSession.resumedSessionId 
            ? { ...session, duration: currentSession.duration, endTime: new Date() }
            : session
        ))
      } else {
        // Nouvelle session - créer
        console.log('🔍 SAVING NEW SESSION TO LOCALSTORAGE:', sessionData)
        const session = {
          id: Date.now().toString(),
          ...sessionData
        }
        setLocalSessions(prev => [session, ...prev])
      }
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
    const clientNames = clients.map(c => typeof c === 'string' ? c : c.name)
    if (!clientNames.includes(clientName)) {
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
    const projectNames = projects.map(p => typeof p === 'string' ? p : p.name)
    if (!projectNames.includes(projectName)) {
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
    if (currentUser) {
      setFirestoreClients(prev => prev.filter(client => client !== clientName))
    } else {
      setLocalClients(prev => prev.filter(client => client !== clientName))
    }
  }

  // Supprimer un projet
  const deleteProject = async (projectName) => {
    if (currentUser) {
      try {
        // Trouver l'ID du projet à supprimer
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', currentUser.uid), where('name', '==', projectName));
        const querySnap = await getDocs(q);
        
        // Supprimer chaque document correspondant
        const deletePromises = [];
        querySnap.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        // Mettre à jour l'état local
        setFirestoreProjects(prev => prev.filter(project => project !== projectName));
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        throw error;
      }
    } else {
      // Utilisateur déconnecté - supprimer de localStorage
      setLocalProjects(prev => prev.filter(project => project !== projectName));
    }
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

  // Fonction pour parser les dates de manière sécurisée
  const safeDateParse = (dateValue) => {
    if (!dateValue) return null;
    
    // Si c'est déjà une date
    if (dateValue instanceof Date) return dateValue;
    
    // Si c'est un Timestamp Firestore
    if (dateValue.toDate) return dateValue.toDate();
    
    // Si c'est une chaîne de caractères, la parser en tenant compte du format
    if (typeof dateValue === 'string') {
      // Essayer de parser la date au format ISO
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) return parsed;
      
      // Essayer de parser d'autres formats si nécessaire
      // Par exemple pour les dates au format 'dd/MM/yyyy'
      const parts = dateValue.split(/[-/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Les mois sont 0-indexés
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    console.warn('Impossible de parser la date:', dateValue);
    return null;
  };

  // Obtenir les sessions par période
  const getSessionsByDateRange = (startDate, endDate) => {
    console.log('getSessionsByDateRange called with:', { startDate, endDate, sessionsCount: sessions.length });
    
    const filtered = sessions.filter(session => {
      const sessionDate = safeDateParse(session.startTime);
      if (!sessionDate) return false;
      
      const start = safeDateParse(startDate);
      const end = safeDateParse(endDate);
      
      if (!start || !end) return false;
      
      return isWithinInterval(sessionDate, { 
        start: startOfDay(start), 
        end: endOfDay(end) 
      });
    });
    
    console.log('Filtered sessions:', filtered.length, 'out of', sessions.length);
    return filtered;
  }

  // Obtenir le temps total par période
  const getTotalTimeByDateRange = (startDate, endDate) => {
    const sessionsInRange = getSessionsByDateRange(startDate, endDate)
    console.log(' getTotalTimeByDateRange - Sessions in range:', sessionsInRange.length)
    if (sessionsInRange.length > 0) {
      console.log(' First session duration:', sessionsInRange[0].duration, typeof sessionsInRange[0].duration)
    }
    const total = sessionsInRange.reduce((total, session) => {
      const duration = typeof session.duration === 'number' ? session.duration : 0
      return total + duration
    }, 0)
    console.log(' Total time calculated:', total)
    return total
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
