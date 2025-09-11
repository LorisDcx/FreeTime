import React, { useState } from 'react'
import { User, Mail, Calendar, LogOut, Trash2, Shield, Database } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme'

const AccountPage = () => {
  const { currentUser, logout } = useAuth()
  const { getTheme } = useTheme()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Non connecté
          </h2>
          <p className="text-gray-600 dark:text-neutral-400">
            Veuillez vous connecter pour accéder à votre compte
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* En-tête du profil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${getTheme().primary} 0%, ${getTheme().primaryDark} 100%)`
            }}
          >
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          
          {/* Informations */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentUser.displayName || 'Utilisateur'}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-neutral-400">
                <Mail className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-neutral-400">
                <Calendar className="w-4 h-4" />
                <span>Membre depuis {formatDate(currentUser.metadata.creationTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistiques du compte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6" style={{ color: getTheme().primary }} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Synchronisation des données
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${getTheme().primary}20` }}
            >
              <Shield className="w-6 h-6" style={{ color: getTheme().primary }} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sécurisé</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Vos données sont chiffrées et sécurisées dans le cloud
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${getTheme().primary}20` }}
            >
              <Database className="w-6 h-6" style={{ color: getTheme().primary }} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Synchronisé</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Accédez à vos données depuis n'importe quel appareil
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${getTheme().primary}20` }}
            >
              <Calendar className="w-6 h-6" style={{ color: getTheme().primary }} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sauvegardé</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Sauvegarde automatique de toutes vos sessions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions du compte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Gestion du compte
        </h2>
        
        <div className="space-y-4">
          {/* Déconnexion */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getTheme().primary}20` }}
              >
                <LogOut className="w-5 h-5" style={{ color: getTheme().primary }} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Se déconnecter
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Fermer votre session actuelle
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Déconnexion
            </button>
          </div>

          {/* Suppression de compte (placeholder) */}
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-300">
                  Supprimer le compte
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Action irréversible - toutes vos données seront perdues
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Supprimer le compte
                </h3>
                <p className="text-gray-600 dark:text-neutral-400 mb-6">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implémenter la suppression de compte
                      setShowDeleteConfirm(false)
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AccountPage
