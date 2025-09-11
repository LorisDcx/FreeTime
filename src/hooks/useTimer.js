import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

export function useTimer() {
  const [sessions, setSessions] = useLocalStorage('freetime_sessions', [])
  const [clients, setClients] = useLocalStorage('freetime_clients', ['Client par défaut'])
  const [projects, setProjects] = useLocalStorage('freetime_projects', ['Projet par défaut'])
  const [dailyGoal, setDailyGoal] = useLocalStorage('freetime_daily_goal', 8) // 8 heures par défaut
  
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
  const stopTimer = () => {
    if (!isRunning) return

    clearInterval(intervalRef.current)
    intervalRef.current = null

    if (currentSession.resumedSessionId) {
      // Mettre à jour la session existante
      setSessions(prev => prev.map(session => 
        session.id === currentSession.resumedSessionId
          ? {
              ...session,
              endTime: new Date(),
              duration: currentSession.duration
            }
          : session
      ))
    } else {
      // Créer une nouvelle session
      const session = {
        id: Date.now().toString(),
        task: currentSession.task,
        client: currentSession.client,
        project: currentSession.project,
        startTime: startTimeRef.current,
        endTime: new Date(),
        duration: currentSession.duration,
        date: format(startTimeRef.current, 'yyyy-MM-dd')
      }
      setSessions(prev => [session, ...prev])
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
  const addSession = (sessionData) => {
    const session = {
      id: Date.now().toString(),
      ...sessionData,
      date: format(new Date(sessionData.startTime), 'yyyy-MM-dd')
    }
    setSessions(prev => [session, ...prev])
  }

  // Supprimer une session
  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
  }

  // Ajouter un client
  const addClient = (clientName) => {
    if (!clients.includes(clientName)) {
      setClients(prev => [...prev, clientName])
    }
  }

  // Ajouter un projet
  const addProject = (projectName) => {
    if (!projects.includes(projectName)) {
      setProjects(prev => [...prev, projectName])
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
  const updateDailyGoal = (hours) => {
    setDailyGoal(hours)
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
    addSession,
    deleteSession,
    addClient,
    addProject,
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
