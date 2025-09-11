# 🚀 Guide de Déploiement - FreeTime Tracker

## 📦 Prérequis

- Application React complète et testée ✅
- Node.js 18+ installé
- Compte sur une plateforme de déploiement

---

## 🌐 Déploiement sur Netlify (Recommandé)

### Option 1: Deploy automatique via Git
1. **Push sur GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FreeTime Tracker"
   git branch -M main
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

2. **Connecter à Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - "New site from Git"
   - Connecter votre repo
   - Build settings automatiques détectées

### Option 2: Deploy manuel
1. **Build de production**
   ```bash
   npm run build
   ```

2. **Upload sur Netlify**
   - Glisser-déposer le dossier `dist/` sur netlify.com
   - Configuration automatique via `netlify.toml`

---

## ⚡ Déploiement sur Vercel

1. **Installation Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Déploiement**
   ```bash
   vercel --prod
   ```

3. **Configuration automatique**
   - Framework: Vite détecté automatiquement
   - Build: `npm run build`
   - Output: `dist`

---

## 🏗️ Déploiement sur autres plateformes

### GitHub Pages
```bash
npm run build
# Upload du dossier dist/ vers gh-pages branch
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 🔧 Configuration Post-Déploiement

### Variables d'environnement
1. **Copier .env.example vers .env**
2. **Ajuster les valeurs pour production**
3. **Configurer sur la plateforme:**
   - Netlify: Site settings > Environment variables
   - Vercel: Project settings > Environment Variables

### Domaine personnalisé (optionnel)
1. **Netlify**: Site settings > Domain management
2. **Vercel**: Project settings > Domains

### SSL automatique ✅
- Netlify et Vercel activent HTTPS automatiquement

---

## 📊 Monitoring & Analytics

### Performance
- **Lighthouse Score**: Viser 90+ sur toutes métriques
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Erreurs (optionnel)
```bash
npm install @sentry/react
# Configuration dans src/main.jsx
```

### Analytics (optionnel)
- Google Analytics 4
- Plausible (respectueux de la vie privée)

---

## 🚀 Checklist de Déploiement

### Avant déploiement
- [ ] Tests complets effectués
- [ ] Build de production fonctionnel (`npm run build`)
- [ ] Pas d'erreurs console en production
- [ ] Responsive testé sur mobile/desktop
- [ ] Exports CSV/PDF fonctionnels

### Configuration
- [ ] `netlify.toml` ou `vercel.json` configuré
- [ ] Variables d'environnement définies
- [ ] Redirections SPA configurées
- [ ] Headers de sécurité activés

### Post-déploiement
- [ ] URL accessible et fonctionnelle
- [ ] HTTPS activé automatiquement
- [ ] PWA installable (si configurée)
- [ ] Temps de chargement < 3 secondes
- [ ] Pas d'erreurs 404

---

## 🔄 Workflow de mise à jour

### Déploiement continu
1. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: nouvelle fonctionnalité"
   git push origin main
   ```

2. **Déploiement automatique**
   - Netlify/Vercel détectent le push
   - Build et déploiement automatiques
   - Notification par email/Slack

### Rollback rapide
- **Netlify**: Deploys > Publish deploy (version précédente)
- **Vercel**: Deployments > Promote to Production

---

## 💡 Optimisations Production

### Performance
- **Code splitting**: Déjà activé avec Vite
- **Tree shaking**: Optimisation automatique
- **Minification**: CSS et JS compressés
- **Lazy loading**: Images et composants

### SEO (optionnel)
```html
<!-- Ajouter dans index.html -->
<meta name="description" content="FreeTime - Time Tracker simple pour freelances">
<meta property="og:title" content="FreeTime Tracker">
<meta property="og:description" content="Outil de suivi du temps ultra-simple">
```

---

## 🎯 URLs de Production

Une fois déployé, l'application sera accessible à :
- **Netlify**: `https://freetime-tracker.netlify.app`
- **Vercel**: `https://freetime-tracker.vercel.app`
- **Domaine personnalisé**: `https://votre-domaine.com`

---

## 📞 Support & Maintenance

### Monitoring
- Surveiller les métriques de performance
- Vérifier les erreurs utilisateur
- Analyser l'usage des fonctionnalités

### Mises à jour
- Dépendances: `npm audit` mensuel
- Fonctionnalités: Roadmap Premium
- Sécurité: Patches automatiques

**🎉 Application prête pour la production !**
