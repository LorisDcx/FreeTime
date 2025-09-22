import React, { useState, useMemo } from 'react'
import { Calendar, Download, TrendingUp, Clock, FileText, BarChart3, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'

const ReportsPage = ({ 
  sessions, 
  formatTime, 
  getSessionsByDateRange, 
  getTotalTimeByDateRange, 
  getProjectStats,
  deleteSession,
  timeFormat = 'duration', // 'duration' ou 'decimal' 
  dailyGoal = 8, // Objectif quotidien en heures
  clients = [],
  projects = []
}) => {
  const { getTheme, currentTheme } = useTheme()
  const { currentUser } = useAuth()
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(timeFormat)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedClient, setSelectedClient] = useState('tous')
  const [selectedProject, setSelectedProject] = useState('tous')

  const periods = [
    { id: 'today', label: "Aujourd'hui", value: 'today' },
    { id: 'week', label: 'Cette semaine', value: 'week' },
    { id: 'month', label: 'Ce mois', value: 'month' },
    { id: 'last7', label: '7 derniers jours', value: 'last7' },
    { id: 'last30', label: '30 derniers jours', value: 'last30' },
    { id: 'custom', label: 'Période personnalisée', value: 'custom' }
  ]

  const getDateRange = () => {
    const now = new Date()
    
    switch (selectedPeriod) {
      case 'today':
        return { start: now, end: now }
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last7':
        return { start: subDays(now, 6), end: now }
      case 'last30':
        return { start: subDays(now, 29), end: now }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : subDays(now, 7),
          end: customEndDate ? new Date(customEndDate) : now
        }
      default:
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    }
  }

  const { start: startDate, end: endDate } = getDateRange()
  
  const filteredSessions = useMemo(() => {
    console.log('Recalculating filteredSessions with', sessions.length, 'sessions')
    let sessionsByDateRange = getSessionsByDateRange ? getSessionsByDateRange(startDate, endDate) : []
    
    // Filtrer par client et projet
    if (selectedClient !== 'tous') {
      sessionsByDateRange = sessionsByDateRange.filter(session => session.client === selectedClient)
    }
    if (selectedProject !== 'tous') {
      sessionsByDateRange = sessionsByDateRange.filter(session => session.project === selectedProject)
    }
    
    return sessionsByDateRange
  }, [sessions, startDate, endDate, getSessionsByDateRange, selectedClient, selectedProject])
  
  const totalTime = useMemo(() => {
    const result = getTotalTimeByDateRange ? getTotalTimeByDateRange(startDate, endDate) : 0
    console.log('Total time calculated:', result)
    return result
  }, [sessions, startDate, endDate, getTotalTimeByDateRange])
  
  const projectStats = useMemo(() => {
    const result = getProjectStats ? getProjectStats(startDate, endDate) : []
    console.log('Project stats calculated:', result)
    return result
  }, [sessions, startDate, endDate, getProjectStats])

  // Fonction pour formater le temps selon le format sélectionné
  const formatTimeValue = (seconds) => {
    if (selectedTimeFormat === 'decimal') {
      return +(seconds / 3600).toFixed(2) // Heures décimales
    } else {
      return seconds // Garder les secondes pour la précision
    }
  }

  const getTimeUnit = () => {
    return selectedTimeFormat === 'decimal' ? 'h' : 'sec'
  }

  // Données pour le graphique en barres par jour
  const dailyData = useMemo(() => {
    const days = {}
    filteredSessions.forEach(session => {
      // Gérer les Timestamp Firestore et les objets Date
      let sessionDate
      if (session.startTime?.toDate) {
        // Timestamp Firestore
        sessionDate = session.startTime.toDate()
      } else if (session.startTime) {
        // Date ou string
        sessionDate = new Date(session.startTime)
      } else {
        console.warn('Session sans startTime:', session)
        return
      }
      
      const day = format(sessionDate, 'yyyy-MM-dd')
      if (!days[day]) {
        days[day] = { date: day, duration: 0, sessions: 0 }
      }
      days[day].duration += session.duration
      days[day].sessions += 1
    })
    
    return Object.values(days)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(day => ({
        ...day,
        dateFormatted: format(new Date(day.date), 'dd/MM', { locale: fr }),
        value: formatTimeValue(day.duration),
        rawDuration: day.duration,
        goalAchieved: day.duration >= (dailyGoal * 3600) // Vérifier si l'objectif est atteint
      }))
  }, [filteredSessions, selectedTimeFormat, dailyGoal])

  // Calculer la valeur max pour l'échelle Y
  const maxValue = useMemo(() => {
    if (dailyData.length === 0) return selectedTimeFormat === 'decimal' ? 8 : 3600
    const max = Math.max(...dailyData.map(day => day.value))
    
    if (selectedTimeFormat === 'decimal') {
      // Arrondir au 0.5 supérieur pour les heures décimales
      return Math.ceil(max * 2) / 2
    } else {
      // Arrondir au multiple de 1800 (30min en secondes) supérieur
      return Math.ceil(max / 1800) * 1800
    }
  }, [dailyData, selectedTimeFormat])

  // Données pour le graphique en secteurs
  const pieData = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
    return projectStats.slice(0, 7).map((stat, index) => ({
      name: `${stat.client} - ${stat.project}`,
      value: formatTimeValue(stat.duration),
      rawDuration: stat.duration,
      color: colors[index % colors.length]
    }))
  }, [projectStats, selectedTimeFormat])

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Tâche', 'Client', 'Projet', 'Début', 'Fin', 'Durée (h)']
    const csvData = filteredSessions.map(session => {
      // Gérer les Timestamp Firestore et les objets Date
      let sessionStartDate
      if (session.startTime?.toDate) {
        // Timestamp Firestore
        sessionStartDate = session.startTime.toDate()
      } else if (session.startTime) {
        // Date ou string
        sessionStartDate = new Date(session.startTime)
      } else {
        sessionStartDate = new Date()
      }

      // Calculer l'heure de fin basée sur la durée
      const sessionEndDate = new Date(sessionStartDate.getTime() + (session.duration * 1000))

      return [
        format(sessionStartDate, 'dd/MM/yyyy'),
        session.task,
        session.client,
        session.project,
        format(sessionStartDate, 'HH:mm'),
        format(sessionEndDate, 'HH:mm'),
        (session.duration / 3600).toFixed(2)
      ]
    })

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `freetime-rapport-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Forcer l'encodage UTF-8
    doc.setDocumentProperties({
      title: 'Rapport TimeProof',
      subject: 'Rapport de temps de travail',
      author: currentUser?.displayName || 'TimeProof User',
      creator: 'TimeProof'
    })

    // Couleurs du thème
    const primaryColor = [59, 130, 246] // Bleu
    const accentColor = [16, 185, 129] // Vert/Turquoise
    const lightGray = [248, 250, 252]
    const darkGray = [71, 85, 105]

    // === DÉGRADÉ SUBTIL PROFESSIONNEL ===
    // Dégradé très discret : vert pâle vers blanc cassé
    
    // Zone 1 : Vert pâle professionnel (haut - 0 à 120px)
    doc.setFillColor(187, 247, 208) // Vert très pâle et discret
    doc.rect(0, 0, 210, 120, 'F')
    
    // Zone 2 : Vert très clair (milieu - 120 à 240px)  
    doc.setFillColor(220, 252, 231) // Vert très clair
    doc.rect(0, 120, 210, 120, 'F')
    
    // Zone 3 : Blanc cassé verdâtre (bas - 240 à 297px)
    doc.setFillColor(248, 254, 249) // Blanc cassé avec soupçon de vert
    doc.rect(0, 240, 210, 57, 'F')
    
    // Transitions ultra-lisses et imperceptibles
    // Transition 1 : vert pâle vers vert très clair (60 étapes pour plus de fluidité)
    for (let i = 0; i < 60; i++) {
      const ratio = i / 60
      const r = Math.round(187 + (220 - 187) * ratio)
      const g = Math.round(247 + (252 - 247) * ratio)
      const b = Math.round(208 + (231 - 208) * ratio)
      doc.setFillColor(r, g, b)
      doc.rect(0, 90 + i * 0.5, 210, 0.8, 'F') // Bandes plus fines et plus nombreuses
    }
    
    // Transition 2 : vert très clair vers blanc cassé (60 étapes)
    for (let i = 0; i < 60; i++) {
      const ratio = i / 60
      const r = Math.round(220 + (248 - 220) * ratio)
      const g = Math.round(252 + (254 - 252) * ratio)
      const b = Math.round(231 + (249 - 231) * ratio)
      doc.setFillColor(r, g, b)
      doc.rect(0, 210 + i * 0.5, 210, 0.8, 'F') // Bandes plus fines et plus nombreuses
    }
    
    // Zone de contenu avec fond blanc opaque
    doc.setFillColor(255, 255, 255) // Blanc 100% opaque (pas de transparence)
    doc.roundedRect(15, 15, 180, 267, 12, 12, 'F')
    

    // === TITRE PRINCIPAL CENTRÉ ===
    // Titre compact centré
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Rapport hebdomadaire TimeProof', 105, 35, { align: 'center' })

    // Informations utilisateur centrées
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Utilisateur'
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Freelance: ${userName}`, 105, 50, { align: 'center' })
    
    // Saut de ligne puis période centrée
    const startDateStr = format(startDate, 'dd/MM/yyyy')
    const endDateStr = format(endDate, 'dd/MM/yyyy')
    doc.text(`Semaine du ${startDateStr} au ${endDateStr}`, 105, 65, { align: 'center' })

    // === STATISTIQUES EN LIGNE ===
    const totalHours = Math.floor(totalTime / 3600)
    const totalMinutes = Math.floor((totalTime % 3600) / 60)
    const totalTimeFormatted = `${totalHours}h${totalMinutes.toString().padStart(2, '0')}`
    
    // Encadré statistiques
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.roundedRect(25, 75, 160, 25, 5, 5, 'F')
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Sessions: ${filteredSessions.length}`, 35, 88)
    
    // Total mis en valeur
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL: ${totalTimeFormatted}`, 130, 88)

    // === TABLEAU DES SESSIONS ===
    let yPos = 115
    
    // Titre du tableau
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detail des sessions:', 25, yPos)
    
    yPos += 15
    
    // En-tête du tableau simple
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(25, yPos - 8, 160, 12, 'F')
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Date', 30, yPos)
    doc.text('Debut', 60, yPos)
    doc.text('Fin', 85, yPos)
    doc.text('Duree', 110, yPos)
    doc.text('Tache', 140, yPos)

    yPos += 15

    // Lignes du tableau
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    // Afficher toutes les sessions avec amélioration visuelle
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    let rowCount = 0
    const maxRowsPerPage = 12 // Limite réduite pour meilleure lisibilité
    
    // Filtrer les sessions vides ou de test
    const validSessions = filteredSessions.filter(session => 
      session.task && 
      session.task.trim() !== '' && 
      session.duration > 0
    )
    
    validSessions.forEach(session => {
      // Nouvelle page si nécessaire
      if (rowCount >= maxRowsPerPage) {
        doc.addPage()
        
        // Reproduire l'en-tête sur nouvelle page
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
        doc.rect(25, 30 - 8, 160, 12, 'F')
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Date', 30, 30)
        doc.text('Debut', 60, 30)
        doc.text('Fin', 85, 30)
        doc.text('Duree', 110, 30)
        doc.text('Tache', 140, 30)
        
        yPos = 45
        rowCount = 0
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
      }
      
      // Gérer les dates
      let sessionStartDate
      if (session.startTime?.toDate) {
        sessionStartDate = session.startTime.toDate()
      } else if (session.startTime) {
        sessionStartDate = new Date(session.startTime)
      } else {
        sessionStartDate = new Date()
      }
      
      const sessionEndDate = new Date(sessionStartDate.getTime() + (session.duration * 1000))
      const sessionHours = Math.floor(session.duration / 3600)
      const sessionMinutes = Math.floor((session.duration % 3600) / 60)
      
      // Ligne alternée simple
      if (rowCount % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(25, yPos - 5, 160, 10, 'F')
      }
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      
      // Utiliser un format de date simple pour éviter l'encodage
      doc.text(format(sessionStartDate, 'dd/MM'), 30, yPos)
      doc.text(format(sessionStartDate, 'HH:mm'), 60, yPos)
      doc.text(format(sessionEndDate, 'HH:mm'), 85, yPos)
      doc.text(`${sessionHours}h${sessionMinutes.toString().padStart(2, '0')}`, 110, yPos)
      
      // Tâche (tronquée et nettoyée)
      const cleanTask = session.task.replace(/[^\x00-\x7F]/g, '') // Supprimer caractères non-ASCII
      const truncatedTask = cleanTask.length > 25 ? cleanTask.substring(0, 25) + '...' : cleanTask
      doc.text(truncatedTask, 140, yPos)
      
      yPos += 12
      rowCount++
    })

    // === FOOTER CENTRÉ ===
    const pageHeight = doc.internal.pageSize.height
    
    // Footer sur une ligne centrée
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm')
    const footerText = `Rapport genere avec TimeProof - Merci pour votre confiance - Genere le: ${generationDate}`
    doc.text(footerText, 105, pageHeight - 20, { align: 'center' })

    // Nom de fichier sans caractères spéciaux
    const filename = `timeproof-rapport-${format(startDate, 'yyyy-MM-dd')}-au-${format(endDate, 'yyyy-MM-dd')}.pdf`
    doc.save(filename)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
                {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rapports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-neutral-400">
              Analysez votre productivité et exportez vos données
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            {/* Sélecteur de format temps */}
            <div className="flex bg-gray-100 dark:bg-neutral-700 rounded-lg p-1">
              <button
                onClick={() => setSelectedTimeFormat('duration')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedTimeFormat === 'duration'
                    ? 'bg-white dark:bg-neutral-600 shadow-sm'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
                }`}
                style={{
                  color: selectedTimeFormat === 'duration' ? getTheme().primary : undefined
                }}
              >
                Temps              
                </button>
              <button
                onClick={() => setSelectedTimeFormat('decimal')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedTimeFormat === 'decimal'
                    ? 'bg-white dark:bg-neutral-600 shadow-sm'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
                }`}
                style={{
                  color: selectedTimeFormat === 'decimal' ? getTheme().primary : undefined
                }}
              >
                Heures
              </button>
            </div>
            
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </motion.div>

        {/* Sélecteur de période */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Période d'analyse
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
                }`}
                style={selectedPeriod === period.value ? { backgroundColor: getTheme().primary } : {}}
              >
                {period.label}
              </button>
            ))}
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}
          
          {/* Filtres Client/Projet pour PDF */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 mt-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-neutral-300 mb-3">
              Filtres pour l'export PDF
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="input-field"
                >
                  <option value="tous">Tous les clients</option>
                  {clients.map((client, index) => {
                    const clientName = typeof client === 'string' ? client : client.name
                    return (
                      <option key={index} value={clientName}>{clientName}</option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Projet
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="input-field"
                >
                  <option value="tous">Tous les projets</option>
                  {projects.map((project, index) => {
                    const projectName = typeof project === 'string' ? project : project.name
                    return (
                      <option key={index} value={projectName}>{projectName}</option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center"
          >
            <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: getTheme().primary }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Temps total
            </h3>
            <p className="text-3xl font-bold" style={{ color: getTheme().primary }}>
              {formatTime ? formatTime(totalTime) : '0:00:00'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card text-center"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: getTheme().accent }} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sessions
            </h3>
            <p className="text-3xl font-bold" style={{ color: getTheme().accent }}>
              {filteredSessions.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card text-center"
          >
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Temps moyen/jour
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {dailyData.length > 0 ? 
                selectedTimeFormat === 'decimal' 
                  ? `${(totalTime / dailyData.length / 3600).toFixed(1)}h`
                  : formatTime ? formatTime(Math.round(totalTime / dailyData.length)) : `${Math.round(totalTime / dailyData.length)}s`
                : selectedTimeFormat === 'decimal' ? '0h' : '0s'
              }
            </p>
          </motion.div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Graphique temporel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-12">
              Temps par jour
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="130%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-600" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    stroke="#6b7280" 
                    className="dark:stroke-neutral-400"
                  />
                  <YAxis 
                    domain={[0, maxValue]}
                    stroke="#6b7280" 
                    className="dark:stroke-neutral-400"
                    label={{ value: getTimeUnit(), angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const rawDuration = props.payload?.rawDuration || 0
                      if (selectedTimeFormat === 'decimal') {
                        return [`${value}h`, 'Temps']
                      } else {
                        return [formatTime ? formatTime(rawDuration) : `${rawDuration}s`, 'Temps']
                      }
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  >
                    {dailyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.goalAchieved ? "#10B981" : getTheme().primary} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Graphique par projet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Répartition par projet
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 5 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const rawDuration = props.payload?.rawDuration || 0
                      if (selectedTimeFormat === 'decimal') {
                        return [`${value}h`, name]
                      } else {
                        return [formatTime ? formatTime(rawDuration) : `${rawDuration}s`, name]
                      }
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Légende du camembert */}
            {pieData.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-neutral-300 truncate">
                      {entry.name}: {selectedTimeFormat === 'decimal' ? `${entry.value}h` : formatTime ? formatTime(entry.rawDuration) : `${entry.rawDuration}s`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tableau des sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sessions détaillées
          </h3>
          
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-neutral-400">
                Aucune session trouvée pour cette période
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Tâche</th>
                    <th className="text-left py-2">Client</th>
                    <th className="text-left py-2">Projet</th>
                    <th className="text-left py-2">Début</th>
                    <th className="text-left py-2">Durée</th>
                    <th className="text-center py-2 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session, index) => (
                    <tr key={session.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-2">
                        {(() => {
                          let sessionDate
                          if (session.startTime?.toDate) {
                            sessionDate = session.startTime.toDate()
                          } else if (session.startTime) {
                            sessionDate = new Date(session.startTime)
                          } else {
                            return 'Date invalide'
                          }
                          return format(sessionDate, 'dd/MM/yyyy')
                        })()}
                      </td>
                      <td className="py-2 font-medium">{session.task}</td>
                      <td className="py-2">{session.client}</td>
                      <td className="py-2">{session.project}</td>
                      <td className="py-2">
                        {(() => {
                          let sessionDate
                          if (session.startTime?.toDate) {
                            sessionDate = session.startTime.toDate()
                          } else if (session.startTime) {
                            sessionDate = new Date(session.startTime)
                          } else {
                            return 'Heure invalide'
                          }
                          return format(sessionDate, 'HH:mm')
                        })()}
                      </td>
                      <td className="py-2 font-mono">
                        {formatTime ? formatTime(session.duration) : '0:00:00'}
                      </td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Supprimer cette session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ReportsPage
