import React, { useState, useEffect } from 'react'
import { Timer, BarChart3, Settings, Play, Pause, Square, Palette, User, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TimerPage from './components/TimerPage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'
import AccountPage from './components/AccountPage'
import AuthModal from './components/AuthModal'
import { useTimer } from './hooks/useTimer'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('timer')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  const { currentTheme, themes, updateTheme, getTheme } = useTheme()
  const { currentUser } = useAuth()
  
  const {
    isRunning,
    currentTime,
    currentSession,
    sessions,
    clients,
    projects,
    dailyGoal,
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
    formatTime,
    getSessionsByDateRange,
    getTotalTimeByDateRange,
    getProjectStats
  } = useTimer()

  // Gestion du mode sombre
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const navItems = [
    {
      id: 'timer',
      name: 'Timer',
      icon: Timer,
      component: TimerPage
    },
    {
      id: 'reports',
      name: 'Rapports',
      icon: BarChart3,
      component: ReportsPage
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: Settings,
      component: SettingsPage
    },
    {
      id: 'account',
      name: 'Mon compte',
      icon: User,
      component: AccountPage
    }
  ]

  const currentPageComponent = navItems.find(item => item.id === currentPage)?.component
  const CurrentComponent = currentPageComponent || TimerPage

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Navigation Desktop */}
      <div className="hidden md:flex">
        <nav 
          className="w-64 h-screen sticky top-0 border-r border-gray-200 dark:border-neutral-700 p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${getTheme().ultraLight} 0%, rgba(255,255,255,0.95) 100%)`,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Gradient décoratif */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${getTheme().primary} 0%, transparent 70%)`
            }}
          />
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${getTheme().primary} 0%, ${getTheme().primaryDark} 100%)`
                }}
              >
                <Timer className="w-6 h-6 text-white relative z-10" />
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at top right, ${getTheme().primaryLight} 0%, transparent 60%)`
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">FreeTime</h1>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Time Tracker</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-item w-full ${currentPage === item.id ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.id === 'timer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAuthModal(true)
                      }}
                      className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-colors"
                      style={{ color: currentUser ? getTheme().primary : undefined }}
                    >
                      {currentUser ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    </button>
                  )}
                </button>
              )
            })}
          </div>

          {/* Indicateur de session active */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg border"
              style={{
                backgroundColor: isDarkMode ? `${getTheme().primary}20` : `${getTheme().primary}10`,
                borderColor: isDarkMode ? `${getTheme().primary}40` : `${getTheme().primary}30`
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full pulse-soft" style={{ backgroundColor: getTheme().primary }}></div>
                <span className="text-sm font-medium" style={{ color: getTheme().primaryDark }}>
                  Session en cours
                </span>
              </div>
              <p className="text-sm truncate" style={{ color: getTheme().primary }}>
                {currentSession?.task || 'Tâche sans nom'}
              </p>
              <p className="text-xs" style={{ color: getTheme().primary }}>
                {currentTime}
              </p>
            </motion.div>
          )}

          {/* Onglet Mon compte */}
          <div className="mt-auto pt-2">
            <button
              onClick={() => setCurrentPage('account')}
              className={`nav-item w-full ${currentPage === 'account' ? 'active' : ''}`}
            >
              <User className="w-5 h-5" />
              <span>Mon compte</span>
            </button>
          </div>

          {/* Sélecteur de thème */}
          <div className="mt-96 pt-44 relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="w-full flex items-center space-x-2 p-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Palette className="w-8 h-5" />
              <span className="text-sm">Thèmes</span>
            </button>

            <AnimatePresence>
              {showThemeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-600 p-2"
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-neutral-300 mb-3">
                      Choisir un thème
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(themes).map(([themeKey, theme]) => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            updateTheme(themeKey)
                            setShowThemeSelector(false)
                            // Forcer la mise à jour de tous les composants
                            setTimeout(() => {
                              window.dispatchEvent(new Event('resize'))
                            }, 100)
                          }}
                          className={`group relative p-3 rounded-xl text-xs transition-all duration-300 ${
                            currentTheme === themeKey
                              ? 'ring-2 shadow-lg transform scale-105'
                              : 'hover:shadow-md hover:scale-102'
                          }`}
                          style={{
                            backgroundColor: theme.ultraLight,
                            ringColor: currentTheme === themeKey ? theme.primary : 'transparent'
                          }}
                        >
                          {/* Dégradé de prévisualisation */}
                          <div 
                            className="w-full h-4 rounded-lg mb-2"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                            }}
                          />
                          
                          {/* Nom du thème */}
                          <div className="flex items-center justify-center space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                            />
                            <span 
                              className="font-medium"
                              style={{ color: theme.primaryDark }}
                            >
                              {theme.name}
                            </span>
                          </div>
                          
                          {/* Indicateur de sélection */}
                          {currentTheme === themeKey && (
                            <div 
                              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                              style={{ backgroundColor: theme.primary }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Contenu principal Desktop */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentComponent
                isRunning={isRunning}
                currentTime={currentTime}
                currentSession={currentSession}
                sessions={sessions}
                clients={clients}
                projects={projects}
                dailyGoal={dailyGoal}
                startTimer={startTimer}
                resumeTimer={resumeTimer}
                stopTimer={stopTimer}
                addSession={addSession}
                deleteSession={deleteSession}
                addClient={addClient}
                addProject={addProject}
                deleteClient={deleteClient}
                deleteProject={deleteProject}
                updateClient={updateClient}
                updateProject={updateProject}
                updateDailyGoal={updateDailyGoal}
                formatTime={formatTime}
                getSessionsByDateRange={getSessionsByDateRange}
                getTotalTimeByDateRange={getTotalTimeByDateRange}
                getProjectStats={getProjectStats}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Contenu principal Mobile */}
        <main className="flex-1 overflow-auto pb-20">
          <CurrentComponent
            isRunning={isRunning}
            currentTime={currentTime}
            currentSession={currentSession}
            sessions={sessions}
            clients={clients}
            projects={projects}
            dailyGoal={dailyGoal}
            startTimer={startTimer}
            resumeTimer={resumeTimer}
            stopTimer={stopTimer}
            addSession={addSession}
            deleteSession={deleteSession}
            addClient={addClient}
            addProject={addProject}
            deleteClient={deleteClient}
            deleteProject={deleteProject}
            updateClient={updateClient}
            updateProject={updateProject}
            updateDailyGoal={updateDailyGoal}
            formatTime={formatTime}
            getSessionsByDateRange={getSessionsByDateRange}
            getTotalTimeByDateRange={getTotalTimeByDateRange}
            getProjectStats={getProjectStats}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        </main>

        {/* Navigation Bottom Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 px-4 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'text-gray-500 dark:text-neutral-400'
                      : 'text-gray-500 dark:text-neutral-400'
                  }`}
                  style={{
                    color: currentPage === item.id ? getTheme().primary : undefined
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.name}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Indicateur flottant session active (Mobile) */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:hidden fixed top-4 right-4 z-50"
        >
          <div 
            className="text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2"
            style={{ backgroundColor: getTheme().primary }}
          >
            <div className="w-2 h-2 bg-white rounded-full pulse-soft"></div>
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
        </motion.div>
      )}

      {/* Modal d'authentification */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default App
