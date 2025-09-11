# 🎯 FreeTime - Time Tracker Ultra-Simple

Un outil de suivi du temps moderne et élégant pour freelances, consultants et petites équipes. Interface ultra-simple avec un design moderne 2025.

## ✨ Fonctionnalités

### 🚀 MVP (Version actuelle)
- **Chrono Start/Stop** - Bouton central avec animations fluides
- **Gestion des tâches** - Saisie avec auto-suggestions basées sur l'historique
- **Clients & Projets** - Dropdowns avec gestion personnalisée
- **Historique des sessions** - Tableau filtrable par période
- **Dashboard analytics** - Graphiques interactifs (barres + secteurs)
- **Exports** - CSV et PDF propres pour facturation
- **Mode sombre** - Basculement automatique
- **Responsive** - Mobile-first avec navigation adaptée
- **PWA Ready** - Installable comme application
- **🔥 Authentification Firebase** - Inscription/Connexion sécurisée
- **☁️ Synchronisation Cloud** - Données sauvegardées dans Firestore
- **📱 Multi-appareils** - Accès à vos données depuis n'importe où
- **🔄 Temps réel** - Synchronisation automatique entre appareils

### 🎨 Design Features
- **Glassmorphism** - Effets de transparence et ombres douces
- **Micro-interactions** - Animations fluides avec Framer Motion
- **Palette moderne** - Couleurs neutres + accents bleu/vert
- **Typographie** - Police Inter pour une lisibilité optimale
- **Icônes** - Lucide React (line-art moderne)

## 🛠️ Stack Technique

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: Tailwind CSS + CSS personnalisé
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icônes**: Lucide React
- **Exports**: jsPDF + html2canvas
- **Dates**: date-fns
- **Storage**: Firestore + LocalStorage (fallback)
- **Déploiement**: Firebase Hosting + GitHub Actions

## 🚀 Installation & Démarrage

### Configuration Firebase
1. **Créer un projet Firebase**
   - Rendez-vous sur [Firebase Console](https://console.firebase.google.com)
   - Créez un nouveau projet
   - Activez Authentication (Email/Password)
   - Activez Firestore Database
   - Activez Hosting

2. **Configuration locale**
```bash
# Cloner le repository
git clone [repository-url]
cd FreeTime

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

3. **Configurer les variables d'environnement**
Modifiez le fichier `.env` avec vos clés Firebase :
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

5. **Accéder à l'application**
```
http://localhost:3000
```

## 📱 Utilisation

### Authentification
1. **Créer un compte** - Inscription avec email/mot de passe
2. **Se connecter** - Connexion sécurisée
3. **Utilisation hors ligne** - Fonctionnement en localStorage sans compte

### Timer Principal
1. Saisissez le nom de votre tâche
2. Choisissez le client et le projet
3. Cliquez sur le bouton **Start** (▶️)
4. Travaillez sur votre tâche
5. Cliquez sur **Stop** (⏹️) pour enregistrer la session

### Navigation
- **Timer** ⏱️ - Chronomètre principal
- **Rapports** 📊 - Analytics et exports
- **Mon compte** 👤 - Profil utilisateur et connexion

### Exports
- **CSV** - Compatible Excel/Sheets pour analyse
- **PDF** - Rapport propre pour clients/facturation

## 📊 Analytics Disponibles

- Temps total par période (jour/semaine/mois)
- Graphique temporel par jour
- Répartition par client/projet (camembert)
- Sessions détaillées avec filtres
- Statistiques générales

## 🔒 Sécurité & Données

### Authentification Firebase
- **Sécurisé** - Chiffrement de bout en bout
- **Règles Firestore** - Accès restreint aux données utilisateur
- **Validation** - Contrôles stricts côté serveur
- **Backup automatique** - Données sauvegardées en temps réel

### Utilisation hors ligne
- **Mode déconnecté** - Fonctionne avec localStorage
- **Synchronisation** - Upload automatique à la reconnexion
- **Pas de perte de données** - Fallback intelligent

## 🎯 Fonctionnalités Premium (Roadmap)

- 📧 Rapports automatiques par email
- 🔗 Intégrations facturation (Stripe, QuickBooks)
- 👥 Multi-utilisateurs (équipes)
- 🔔 Notifications intelligentes
- 🏢 Organisations et espaces de travail
- 📈 Analytics avancés

## 💰 Modèle de Monétisation

### Freemium
- **Gratuit**: 1 client, 5 projets, historique limité
- **Premium** (5-10€/mois): Illimité + exports avancés
- **Teams** (5€/user/mois): Dashboard équipe + collaboratif

## 🔧 Configuration

### Clients & Projets
Ajoutez vos clients et projets dans **Paramètres** pour une sélection rapide lors du chronométrage.

### Mode Sombre
Basculez automatiquement entre thème clair et sombre selon vos préférences.

### Export de Données
Sauvegardez toutes vos données en JSON depuis les paramètres.

## 🎨 Personnalisation

Le design suit les tendances 2025 avec une palette personnalisable dans `tailwind.config.js`:

```javascript
colors: {
  primary: { 500: '#3B82F6' },    // Bleu électrique
  accent: { 500: '#10B981' },     // Vert menthe
  neutral: { 50: '#F9FAFB' }      // Fond clair
}
```

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Firebase Hosting
```bash
# Déploiement manuel
firebase deploy

# Déploiement automatique via GitHub Actions
# Configuré automatiquement lors du push sur main
```

### Configuration CI/CD
Le projet utilise GitHub Actions pour le déploiement automatique :
- **Build automatique** sur chaque push
- **Tests** avant déploiement  
- **Déploiement Firebase** automatique
- **URL de preview** pour les pull requests

### Variables d'environnement
Pour le déploiement, configurez ces secrets GitHub :
```
FIREBASE_SERVICE_ACCOUNT_KEY  # Clé de service Firebase
```

## 📝 License

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

---

**Développé avec ❤️ pour simplifier le time tracking des freelances**
