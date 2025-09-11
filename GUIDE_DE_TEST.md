# 🧪 Guide de Test - FreeTime Tracker

## 🚀 Démarrage de l'Application

1. **Lancer l'application**
   ```bash
   npm run dev
   ```
   ➡️ L'application devrait s'ouvrir sur `http://localhost:3000`

2. **Vérifier le chargement**
   - ✅ Interface moderne avec design glassmorphism
   - ✅ Navigation sidebar (desktop) ou bottom nav (mobile)
   - ✅ Timer central avec grand bouton rond

---

## ⏱️ Test du Timer Principal

### Première utilisation
1. **Interface initiale**
   - ✅ Bouton Start gris (désactivé) 
   - ✅ Champ "Nom de la tâche..." vide
   - ✅ Dropdowns "Client par défaut" et "Projet par défaut"
   - ✅ Message "Saisissez le nom de votre tâche pour commencer"

2. **Activation du timer**
   - 📝 Saisir "Développement site web"
   - ✅ Le bouton devient bleu et actif
   - 🖱️ Cliquer sur Start
   - ✅ Bouton devient rouge avec icône Stop
   - ✅ Timer commence à compter (00:00:01, 00:00:02...)
   - ✅ Animation ripple lors du clic
   - ✅ Indicateur "Session en cours" apparaît

3. **Session active**
   - ✅ Desktop: Carte "Session en cours" dans sidebar
   - ✅ Mobile: Indicateur flottant en haut à droite
   - ✅ Nom de la tâche affiché sous le timer
   - ✅ Point qui pulse à côté de "Session en cours"

4. **Arrêt du timer**
   - 🖱️ Cliquer sur Stop (bouton carré rouge)
   - ✅ Session sauvée automatiquement
   - ✅ Retour à l'écran initial
   - ✅ Champ tâche vide et prêt pour nouvelle session

---

## 📊 Test des Fonctionnalités Avancées

### Auto-suggestions
1. **Créer plusieurs sessions**
   - Créer session "Développement site web"
   - Créer session "Réunion client"  
   - Créer session "Développement API"

2. **Tester les suggestions**
   - 📝 Taper "Dev" dans le champ tâche
   - ✅ Liste déroulante avec "Développement site web" et "Développement API"
   - 🖱️ Cliquer sur une suggestion
   - ✅ Champ se remplit automatiquement

### Gestion Clients/Projets
1. **Aller dans Paramètres** ⚙️
   - 🖱️ Cliquer sur "Ajouter" dans section Clients
   - 📝 Saisir "Client ABC" → Sauver
   - 🖱️ Cliquer sur "Ajouter" dans section Projets  
   - 📝 Saisir "Site E-commerce" → Sauver

2. **Utiliser les nouveaux éléments**
   - ↩️ Retour au Timer
   - 🖱️ Ouvrir dropdown Client
   - ✅ "Client ABC" disponible
   - 🖱️ Ouvrir dropdown Projet
   - ✅ "Site E-commerce" disponible

---

## 📈 Test des Rapports & Analytics

### Page Rapports
1. **Accéder aux rapports** 📊
   - ✅ Cartes statistiques: Temps total, Sessions, Temps moyen/jour
   - ✅ Sélecteur de période fonctionnel

2. **Graphiques**
   - ✅ Graphique en barres "Temps par jour"  
   - ✅ Graphique en secteurs "Répartition par projet"
   - ✅ Données cohérentes avec les sessions créées

3. **Tableau des sessions**
   - ✅ Liste détaillée: Date, Tâche, Client, Projet, Début, Durée
   - ✅ Formatage correct des heures
   - ✅ Tri par date décroissante

### Filtrage par période
1. **Tester les périodes prédéfinies**
   - 🖱️ "Aujourd'hui" → Affiche les sessions du jour
   - 🖱️ "Cette semaine" → Affiche la semaine courante
   - 🖱️ "7 derniers jours" → Période glissante

2. **Période personnalisée**
   - 🖱️ "Période personnalisée"
   - ✅ Champs date de début/fin apparaissent
   - 📅 Sélectionner dates → Données filtrées

---

## 💾 Test des Exports

### Export CSV
1. **Générer CSV**
   - 📊 Dans Rapports, cliquer "CSV"
   - ✅ Fichier `freetime-rapport-YYYY-MM-DD.csv` téléchargé
   - 📋 Ouvrir dans Excel: colonnes bien formatées

### Export PDF
1. **Générer PDF**
   - 📊 Dans Rapports, cliquer "PDF"
   - ✅ Fichier `freetime-rapport-YYYY-MM-DD.pdf` téléchargé
   - 📄 Ouvrir: rapport propre avec en-tête et sessions

---

## 🎨 Test du Design & UX

### Mode Sombre
1. **Basculer le thème**
   - ⚙️ Paramètres → Toggle "Mode sombre"
   - ✅ Interface passe en thème sombre
   - ✅ Toutes les pages respectent le mode sombre
   - ✅ Toggle se souvient du choix

### Responsive Design
1. **Test mobile** 📱
   - 🔧 DevTools → Mode mobile
   - ✅ Navigation bottom bar (Timer, Rapports, Paramètres)
   - ✅ Timer adapté à l'écran mobile
   - ✅ Indicateur flottant pendant session active

2. **Test desktop** 🖥️
   - ✅ Sidebar navigation
   - ✅ Layout 2 colonnes optimisé
   - ✅ Cartes "Session en cours" dans sidebar

---

## 🔄 Test de Persistance

### Données sauvées
1. **Créer des données**
   - Faire quelques sessions
   - Ajouter clients/projets
   - Changer en mode sombre

2. **Tester la persistance**
   - 🔄 Rafraîchir la page (F5)
   - ✅ Sessions conservées
   - ✅ Clients/projets conservés
   - ✅ Mode sombre conservé

3. **Gestion des données**
   - ⚙️ Paramètres → "Exporter" 
   - ✅ Fichier JSON complet téléchargé
   - ⚠️ Test "Effacer tout" (optionnel - supprime tout)

---

## 🎯 Scénario Utilisateur Complet

### Workflow freelance type
1. **Setup initial**
   - Ajouter 2-3 clients
   - Ajouter 3-4 projets

2. **Session de travail**
   - Créer session "Intégration paiements" 
   - Client "Client ABC" + Projet "Site E-commerce"
   - Laisser tourner 2-3 minutes
   - Arrêter et créer nouvelle session

3. **Analyse & Export**
   - Consulter statistiques du jour
   - Vérifier graphiques
   - Exporter en PDF pour facturation

---

## ✅ Checklist de Validation

### Fonctionnalités Core
- [ ] Timer Start/Stop fonctionnel
- [ ] Sauvegarde automatique des sessions
- [ ] Auto-suggestions basées sur historique
- [ ] Gestion clients/projets personnalisés
- [ ] Sessions d'aujourd'hui affichées

### Analytics & Reports  
- [ ] Graphique temps par jour
- [ ] Graphique répartition projets
- [ ] Filtrage par période
- [ ] Export CSV formaté
- [ ] Export PDF professionnel

### UX & Design
- [ ] Design glassmorphism moderne
- [ ] Animations fluides (ripple, transitions)
- [ ] Mode sombre fonctionnel
- [ ] Navigation responsive
- [ ] Interface mobile optimisée

### Persistance & Performance
- [ ] Données sauvées en localStorage
- [ ] Persistance après refresh
- [ ] Export/import des données
- [ ] Performance fluide

---

## 🐛 Points d'Attention

### Erreurs potentielles
1. **Si le timer ne démarre pas**
   - Vérifier qu'une tâche est saisie
   - Le bouton doit être bleu pour être actif

2. **Si les graphiques ne s'affichent pas**
   - Créer au moins 2-3 sessions
   - Vérifier que les sessions ont des durées différentes

3. **Si l'export PDF ne fonctionne pas**
   - Vérifier la console pour erreurs jsPDF
   - Peut nécessiter sessions existantes

### Améliorations futures
- Notifications après X heures de travail
- Intégration facturation (Stripe)
- Synchronisation cloud
- Mode équipe multi-utilisateurs

---

**🎉 L'application est prête pour utilisation en production !**
