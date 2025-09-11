import React, { useState } from 'react'
import { Moon, Sun, Plus, Trash2, Edit3, Save, X, User, Briefcase, Palette, Database, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

const SettingsPage = ({ 
  isDarkMode, 
  setIsDarkMode, 
  clients = [], 
  projects = [], 
  dailyGoal, 
  updateDailyGoal,
  sessions = [],
  addClient, 
  addProject,
  deleteClient,
  deleteProject,
  updateClient,
  updateProject
}) => {
  const { getTheme, currentTheme } = useTheme()
  const [newClient, setNewClient] = useState('')
  const [newProject, setNewProject] = useState('')
  const [editingClient, setEditingClient] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [editClientValue, setEditClientValue] = useState('')
  const [editProjectValue, setEditProjectValue] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [tempDailyGoal, setTempDailyGoal] = useState(dailyGoal)

  const handleAddClient = () => {
    if (newClient.trim() && addClient) {
      addClient(newClient.trim())
      setNewClient('')
      setShowAddClient(false)
    }
  }

  const handleAddProject = () => {
    if (newProject.trim() && addProject) {
      addProject(newProject.trim())
      setNewProject('')
      setShowAddProject(false)
    }
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setEditClientValue(client)
  }

  const handleSaveClient = () => {
    if (editClientValue.trim() && updateClient) {
      updateClient(editingClient, editClientValue.trim())
      setEditingClient(null)
      setEditClientValue('')
    }
  }

  const handleCancelEditClient = () => {
    setEditingClient(null)
    setEditClientValue('')
  }

  const handleDeleteClient = (client) => {
    if (deleteClient && window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client}" ?`)) {
      deleteClient(client)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setEditProjectValue(project)
  }

  const handleSaveProject = () => {
    if (editProjectValue.trim() && updateProject) {
      updateProject(editingProject, editProjectValue.trim())
      setEditingProject(null)
      setEditProjectValue('')
    }
  }

  const handleCancelEditProject = () => {
    setEditingProject(null)
    setEditProjectValue('')
  }

  const handleDeleteProject = (project) => {
    if (deleteProject && window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project}" ?`)) {
      deleteProject(project)
    }
  }

  const getTotalSessions = () => sessions.length
  const getTotalTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const exportData = () => {
    const data = {
      sessions,
      clients,
      projects,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `freetime-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            Gérez vos préférences et données
          </p>
        </motion.div>

        <div className="space-y-8">
          
          {/* Apparence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-6 h-6" style={{ color: getTheme().primary }} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Apparence
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Mode sombre</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Basculer entre le thème clair et sombre
                </p>
              </div>
              <button
                onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className="sr-only">Toggle dark mode</span>
              </button>
            </div>
          </motion.div>

          {/* Objectif quotidien */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6" style={{ color: getTheme().primary }} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Objectif quotidien
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Heures de travail par jour
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Définissez votre objectif quotidien pour rester motivé
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={tempDailyGoal}
                  onChange={(e) => setTempDailyGoal(parseFloat(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-center focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: getTheme().primary,
                    '--tw-ring-color': getTheme().primaryLight
                  }}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-neutral-400">
                  heures
                </span>
                {tempDailyGoal !== dailyGoal && (
                  <button
                    onClick={() => {
                      updateDailyGoal && updateDailyGoal(tempDailyGoal)
                    }}
                    className="btn-primary px-3 py-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6" style={{ color: getTheme().primary }} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Clients
                </h2>
              </div>
              <button
                onClick={() => setShowAddClient(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <AnimatePresence>
              {showAddClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      placeholder="Nom du client..."
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                    />
                    <button
                      onClick={handleAddClient}
                      className="btn-primary flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddClient(false)
                        setNewClient('')
                      }}
                      className="btn-secondary flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {clients.length === 0 ? (
                <p className="text-gray-500 dark:text-neutral-400 text-center py-4">
                  Aucun client configuré
                </p>
              ) : (
                clients.map((client, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                  >
                    {editingClient === client ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editClientValue}
                          onChange={(e) => setEditClientValue(e.target.value)}
                          className="input-field flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveClient()}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveClient}
                          className="btn-primary flex items-center space-x-1"
                          disabled={!editClientValue.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditClient}
                          className="btn-secondary flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {client}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600 dark:text-neutral-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Projets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6" style={{ color: getTheme().primary }} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Projets
                </h2>
              </div>
              <button
                onClick={() => setShowAddProject(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <AnimatePresence>
              {showAddProject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      placeholder="Nom du projet..."
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                    />
                    <button
                      onClick={handleAddProject}
                      className="btn-primary flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddProject(false)
                        setNewProject('')
                      }}
                      className="btn-secondary flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-gray-500 dark:text-neutral-400 text-center py-4">
                  Aucun projet configuré
                </p>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg"
                  >
                    {editingProject === project ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editProjectValue}
                          onChange={(e) => setEditProjectValue(e.target.value)}
                          className="input-field flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveProject()}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveProject}
                          className="btn-primary flex items-center space-x-1"
                          disabled={!editProjectValue.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditProject}
                          className="btn-secondary flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600 dark:text-neutral-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-6 h-6" style={{ color: getTheme().primary }} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Statistiques générales
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: getTheme().primary }}>
                  {getTotalSessions()}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Sessions totales
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: getTheme().primary }}>
                  {formatTime(getTotalTime())}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Temps total
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: getTheme().primary }}>
                  {clients.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Clients
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: getTheme().primary }}>
                  {projects.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Projets
                </p>
              </div>
            </div>
          </motion.div>

          {/* Données */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-6 h-6" style={{ color: getTheme().primary }} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestion des données
              </h2>
            </div>

            <div className="space-y-4">
              <div 
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border"
                style={{
                  backgroundColor: `${getTheme().primary}10`,
                  borderColor: `${getTheme().primary}30`
                }}
              >
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium" style={{ color: getTheme().primaryDark }}>
                    Exporter les données
                  </h3>
                  <p className="text-sm" style={{ color: getTheme().primary }}>
                    Téléchargez une sauvegarde de toutes vos données
                  </p>
                </div>
                <button
                  onClick={exportData}
                  className="btn-primary bg-blue-600 hover:bg-blue-700"
                >
                  Exporter
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium text-red-900 dark:text-red-300">
                    Effacer toutes les données
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Supprime définitivement toutes les sessions, clients et projets
                  </p>
                </div>
                <button
                  onClick={clearAllData}
                  className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-300 dark:border-red-700"
                >
                  Effacer tout
                </button>
              </div>
            </div>
          </motion.div>

          {/* À propos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card text-center"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              FreeTime Tracker
            </h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              Un outil simple et efficace pour tracker votre temps de travail
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              Version 1.0.0 - Développé avec ❤️ pour les freelances
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
