import React, { useState, useEffect } from 'react'
import { ChevronDown, Play, Square, Clock, Lightbulb, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

const TimerPage = ({ 
  isRunning, 
  currentTime, 
  currentSession, 
  sessions, 
  startTimer, 
  resumeTimer,
  stopTimer,
  clients = ['Client par défaut'],
  projects = ['Projet par défaut'],
  dailyGoal = 8,
  formatTime
}) => {
  const { getTheme, currentTheme } = useTheme()
  const [taskName, setTaskName] = useState('')
  const [selectedClient, setSelectedClient] = useState('Client par défaut')
  const [selectedProject, setSelectedProject] = useState('Projet par défaut')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [ripples, setRipples] = useState([])
  const [taskSuggestions, setTaskSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [resumeMenuSession, setResumeMenuSession] = useState(null)

  useEffect(() => {
    if (taskName.length > 1) {
      const suggestions = sessions
        .filter(session => 
          session.task.toLowerCase().includes(taskName.toLowerCase()) &&
          session.task !== taskName
        )
        .map(session => session.task)
        .filter((task, index, self) => self.indexOf(task) === index)
        .slice(0, 5)
      
      setTaskSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [taskName, sessions])

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resumeMenuSession) {
        setResumeMenuSession(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [resumeMenuSession])

  const handleStartStop = () => {
    if (isRunning) {
      stopTimer()
      setTaskName('')
    } else {
      if (taskName.trim()) {
        startTimer(taskName, selectedClient, selectedProject)
        
        const newRipple = {
          id: Date.now(),
          x: 50,
          y: 50
        }
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
    }
  }

  const getTodaySessions = () => {
    const today = new Date().toDateString()
    return sessions.filter(session => new Date(session.startTime).toDateString() === today)
  }

  const getTodayTotalTime = () => {
    const todaySessions = getTodaySessions()
    
    // Si une session est en cours et qu'elle correspond à une reprise de tâche
    if (isRunning && currentSession && currentSession.resumedSessionId) {
      // Filtrer les sessions pour exclure celle qui est reprise
      const sessionsExcludingResumed = todaySessions.filter(session => session.id !== currentSession.resumedSessionId)
      let totalSeconds = sessionsExcludingResumed.reduce((total, session) => total + (session.duration || 0), 0)
      
      // Ajouter la durée actuelle de la session en cours (qui inclut le temps original + nouveau temps)
      totalSeconds += currentSession.duration
      
      return totalSeconds
    } else {
      // Calcul normal : toutes les sessions terminées + session en cours si elle existe
      let totalSeconds = todaySessions.reduce((total, session) => total + (session.duration || 0), 0)
      
      if (isRunning && currentSession && currentSession.duration) {
        totalSeconds += currentSession.duration
      }
      
      return totalSeconds
    }
  }

  const canStartTimer = taskName.trim().length > 0

  // Grouper les sessions par projet
  const getGroupedSessions = () => {
    return getTodaySessions().reduce((groups, session) => {
      const key = `${session.client} - ${session.project}`
      if (!groups[key]) {
        groups[key] = {
          client: session.client,
          project: session.project,
          sessions: [],
          totalDuration: 0
        }
      }
      groups[key].sessions.push(session)
      groups[key].totalDuration += session.duration
      return groups
    }, {})
  }

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex flex-col">
      {/* Header global */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 px-4 flex-shrink-0"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          FreeTime Tracker
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-neutral-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Aujourd'hui: {formatTime ? formatTime(getTodayTotalTime()) : '00:00:00'}</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span>{getTodaySessions().length} sessions</span>
        </div>
      </motion.div>

      {/* Layout 2 colonnes avec hauteur fixe */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-8 pb-8 overflow-hidden">

        {/* COLONNE GAUCHE - Timer et formulaire */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center relative overflow-hidden"
          >
            {/* Bouton timer principal */}
            <div className="relative my-2 mb-16">
              <motion.button
                onClick={handleStartStop}
                disabled={!isRunning && !canStartTimer}
                className={`timer-button mx-auto relative ${
                  isRunning 
                    ? 'stop' 
                    : canStartTimer 
                      ? 'start' 
                      : 'bg-gray-300 dark:bg-neutral-600 text-gray-500 dark:text-neutral-400 cursor-not-allowed'
                }`}
                whileHover={canStartTimer || isRunning ? { scale: 1.05 } : {}}
                whileTap={canStartTimer || isRunning ? { scale: 0.95 } : {}}
                animate={isRunning ? { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* Ripple effects */}
                {ripples.map(ripple => (
                  <div
                    key={ripple.id}
                    className="absolute inset-0 rounded-full border-2 border-blue-400 ripple"
                    style={{
                      left: `${ripple.x}%`,
                      top: `${ripple.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
                
                {isRunning ? (
                  <Square className="w-32 h-8" />
                ) : (
                  <Play className="w-32 h-8" />
                )}
              </motion.button>
            </div>

            {/* Temps actuel */}
            <motion.div
              key={currentTime}
              initial={{ scale: 1 }}
              animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
              className="mb-24"
            >
              <div className="text-4xl md:text-5xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                {currentTime}
              </div>
              {isRunning && currentSession?.task && (
                <p className="text-lg truncate" style={{ color: getTheme().primary }}>
                  {currentSession.task}
                </p>
              )}
            </motion.div>

            {/* Formulaire de saisie */}
            {!isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Saisie tâche */}
                <div className="relative">
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Que travaillez-vous aujourd'hui ?"
                    className="input-field text-center text-lg"
                    onFocus={() => setShowSuggestions(taskSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  
                  {/* Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 mt-1"
                      >
                        {taskSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setTaskName(suggestion)
                              setShowSuggestions(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sélection Client et Projet */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Client */}
                  <div className="relative mb-12">
                    <button
                      onClick={() => setShowClientDropdown(!showClientDropdown)}
                      className="input-field flex items-center justify-between text-left"
                    >
                      <span className="truncate">{selectedClient}</span>
                      <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                    </button>
                    
                    <AnimatePresence>
                      {showClientDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 mt-1 max-h-24 overflow-y-auto"
                        >
                          {clients.map((client, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedClient(client)
                                setShowClientDropdown(false)
                              }}
                              className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-neutral-700 last:border-b-0 ${
                                selectedClient === client ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                              }`}
                              style={{
                                backgroundColor: selectedClient === client ? `${getTheme().primary}15` : 'transparent',
                                color: selectedClient === client ? getTheme().primary : undefined
                              }}
                              onMouseEnter={(e) => {
                                if (selectedClient !== client) {
                                  e.target.style.backgroundColor = `${getTheme().primary}10`
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedClient !== client) {
                                  e.target.style.backgroundColor = 'transparent'
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{client}</span>
                                {selectedClient === client && (
                                  <span className="ml-2" style={{ color: getTheme().primary }}>✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Projet */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="input-field flex items-center justify-between text-left"
                    >
                      <span className="truncate">{selectedProject}</span>
                      <ChevronDown className="w-4 h-4 flex-shrink-0 ml" />
                    </button>
                    
                    <AnimatePresence>
                      {showProjectDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 mt-1 max-h-24 overflow-y-auto"
                        >
                          {projects.map((project, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedProject(project)
                                setShowProjectDropdown(false)
                              }}
                              className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-neutral-700 last:border-b-0 ${
                                selectedProject === project ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                              }`}
                              style={{
                                backgroundColor: selectedProject === project ? `${getTheme().primary}15` : 'transparent',
                                color: selectedProject === project ? getTheme().primary : undefined
                              }}
                              onMouseEnter={(e) => {
                                if (selectedProject !== project) {
                                  e.target.style.backgroundColor = `${getTheme().primary}10`
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedProject !== project) {
                                  e.target.style.backgroundColor = 'transparent'
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{project}</span>
                                {selectedProject === project && (
                                  <span className="ml-2" style={{ color: getTheme().primary }}>✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {!canStartTimer && (
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mt-4">
                    Saisissez le nom de votre tâche pour commencer
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Objectif du jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getTheme().primary }}></div>
                Objectif du jour
              </h3>
              <span className="text-sm text-gray-500 dark:text-neutral-400">
                {dailyGoal}h visé
              </span>
            </div>

            <div className="space-y-3">
              {/* Barre de progression */}
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((getTodayTotalTime() / (dailyGoal * 3600)) * 100, 100)}%`
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full transition-colors duration-500"
                    style={{
                      background: getTodayTotalTime() >= dailyGoal * 3600 
                        ? '#10B981' 
                        : `linear-gradient(to right, ${getTheme().primary}, ${getTheme().primaryDark})`
                    }}
                  />
                </div>
                
                {/* Indicateurs sur la barre */}
                <div className="absolute inset-0 flex items-center">
                  {[0.25, 0.5, 0.75].map((milestone, index) => (
                    <div
                      key={index}
                      className="absolute w-0.5 h-3 bg-white/30"
                      style={{ left: `${milestone * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-600 dark:text-neutral-400">Actuel: </span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {formatTime ? formatTime(getTodayTotalTime()) : '00:00:00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-neutral-400">Reste: </span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {formatTime ? 
                        formatTime(Math.max(0, (dailyGoal * 3600) - getTodayTotalTime())) : 
                        '00:00:00'
                      }
                    </span>
                  </div>
                </div>
                
                {/* Badge de statut */}
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: getTodayTotalTime() >= dailyGoal * 3600
                      ? '#D1FAE5' 
                      : getTodayTotalTime() >= (dailyGoal * 3600 * 0.8)
                      ? '#FED7AA'
                      : `${getTheme().primary}20`,
                    color: getTodayTotalTime() >= dailyGoal * 3600
                      ? '#047857'
                      : getTodayTotalTime() >= (dailyGoal * 3600 * 0.8)
                      ? '#C2410C'
                      : getTheme().primaryDark
                  }}
                >
                  {getTodayTotalTime() >= dailyGoal * 3600
                    ? '🎉 Objectif atteint!'
                    : getTodayTotalTime() >= (dailyGoal * 3600 * 0.8)
                    ? '🔥 Presque là!'
                    : '💪 En route!'
                  }
                </div>
              </div>

              {/* Message motivant */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  {getTodayTotalTime() >= dailyGoal * 3600
                    ? "Excellent travail ! Vous avez atteint votre objectif quotidien."
                    : `${Math.round(((getTodayTotalTime() / (dailyGoal * 3600)) * 100))}% de votre objectif accompli.`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* COLONNE DROITE - Sessions du jour groupées (scrollable) */}
        <div className="flex flex-col h-full">
          {getTodaySessions().length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card flex-1 flex flex-col min-h-0"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2" style={{ color: getTheme().primary }} />
                Sessions d'aujourd'hui
              </h3>
              
              {/* Sessions groupées par projet - Zone scrollable */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-3 max-h-[42rem] min-h-96">
                {Object.entries(getGroupedSessions()).map(([key, group]) => (
                  <div key={key} className="border-b border-gray-100 dark:border-neutral-700 pb-4 last:border-b-0 last:pb-0">
                    {/* En-tête du groupe */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {group.client} • {group.project}
                      </h4>
                      <span 
                        className="text-sm font-mono font-bold px-2 py-1 rounded"
                        style={{
                          color: getTheme().primary,
                          backgroundColor: `${getTheme().primary}15`
                        }}
                      >
                        {formatTime ? formatTime(group.totalDuration) : '00:00:00'}
                      </span>
                    </div>
                    
                    {/* Liste des sessions */}
                    <div className="space-y-2">
                      {group.sessions
                        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                        .map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-600 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                              {session.task}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(session.startTime).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <div className="text-right">
                              <span className="text-xs mb-1 block" style={{ color: getTheme().primary }}>
                                {formatTime ? formatTime(session.duration) : `${session.duration}s`}
                              </span>
                            </div>
                            {!isRunning && (
                              <div className="relative">
                                <button
                                  onClick={() => setResumeMenuSession(session)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-opacity-10"
                                  style={{ 
                                    color: getTheme().primary,
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = `${getTheme().primary}10`
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                  }}
                                  title="Reprendre cette tâche"
                                >
                                  <Play className="w-3 h-3" />
                                </button>

                                {/* Menu contextuel */}
                                <AnimatePresence>
                                  {resumeMenuSession?.id === session.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 min-w-36"
                                    >
                                      <div className="p-1">
                                        <button
                                          onClick={() => {
                                            // Nouvelle session avec même intitulé
                                            setTaskName(session.task)
                                            setSelectedClient(session.client)
                                            setSelectedProject(session.project)
                                            setResumeMenuSession(null)
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 transition-colors flex items-center space-x-2"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Nouvelle session</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            // Reprendre la session existante
                                            resumeTimer(session)
                                            setResumeMenuSession(null)
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center space-x-2"
                                          style={{ color: getTheme().primary }}
                                          onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = `${getTheme().primary}10`
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                          }}
                                        >
                                          <Play className="w-3 h-3" />
                                          <span>Continuer session</span>
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card text-center flex-1 flex flex-col justify-center"
            >
              <div className="py-12">
                <Clock className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getTheme().primary }}></div>
                  Sessions d'aujourd'hui
                </h3>
                <p className="text-gray-500 dark:text-neutral-400">
                  Commencez votre première session !
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimerPage
