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

### 🎨 Design Features
- **Glassmorphism** - Effets de transparence et ombres douces
- **Micro-interactions** - Animations fluides avec Framer Motion
- **Palette moderne** - Couleurs neutres + accents bleu/vert
- **Typographie** - Police Inter pour une lisibilité optimale
- **Icônes** - Lucide React (line-art moderne)

## 🛠️ Stack Technique

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + CSS personnalisé
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icônes**: Lucide React
- **Exports**: jsPDF + html2canvas
- **Dates**: date-fns
- **Storage**: LocalStorage (MVP)

## 🚀 Installation & Démarrage

1. **Installer les dépendances**
```bash
npm install
```

2. **Démarrer le serveur de développement**
```bash
npm run dev
```

3. **Accéder à l'application**
```
http://localhost:3000
```

## 📱 Utilisation

### Timer Principal
1. Saisissez le nom de votre tâche
2. Choisissez le client et le projet
3. Cliquez sur le bouton **Start** (▶️)
4. Travaillez sur votre tâche
5. Cliquez sur **Stop** (⏹️) pour enregistrer la session

### Navigation
- **Timer** ⏱️ - Chronomètre principal
- **Rapports** 📊 - Analytics et exports
- **Paramètres** ⚙️ - Configuration et données

### Exports
- **CSV** - Compatible Excel/Sheets pour analyse
- **PDF** - Rapport propre pour clients/facturation

## 📊 Analytics Disponibles

- Temps total par période (jour/semaine/mois)
- Graphique temporel par jour
- Répartition par client/projet (camembert)
- Sessions détaillées avec filtres
- Statistiques générales

## 🎯 Fonctionnalités Premium (Roadmap)

- 📧 Rapports automatiques par email
- 🔗 Intégrations facturation (Stripe, QuickBooks)
- 👥 Multi-utilisateurs (équipes)
- 🔔 Notifications intelligentes
- ☁️ Synchronisation cloud
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

### Hébergement recommandé
- **Frontend**: Vercel, Netlify
- **Futur Backend**: Supabase, Firebase

## 📝 License

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

---

**Développé avec ❤️ pour simplifier le time tracking des freelances**
