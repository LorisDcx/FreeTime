# Configuration GitHub Actions pour Firebase

Ce guide explique comment configurer les secrets GitHub pour permettre le déploiement automatique vers Firebase.

## 🔑 Obtenir la clé de service Firebase

### 1. Accéder à la console Firebase
1. Rendez-vous sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `freetime-2`
3. Cliquez sur l'icône ⚙️ (Paramètres du projet)

### 2. Créer une clé de service
1. Allez dans l'onglet **Comptes de service**
2. Faites défiler jusqu'à **Clés privées des comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée**
4. Choisissez le format **JSON**
5. Cliquez sur **Générer la clé**
6. Le fichier JSON sera téléchargé automatiquement

### 3. Préparer la clé pour GitHub
1. Ouvrez le fichier JSON téléchargé dans un éditeur de texte
2. Copiez tout le contenu du fichier (le JSON complet)
3. Assurez-vous de copier exactement le JSON, avec les accolades `{ }`

## 🔒 Configurer les secrets GitHub

### 1. Accéder aux paramètres du repository
1. Allez sur votre repository GitHub : `https://github.com/votre-username/FreeTime`
2. Cliquez sur **Settings** (dans le menu du repository)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**

### 2. Ajouter le secret Firebase
1. Cliquez sur **New repository secret**
2. Dans **Name**, saisissez : `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Dans **Secret**, collez le contenu JSON complet de la clé de service
4. Cliquez sur **Add secret**

## ✅ Vérification du déploiement automatique

Une fois les secrets configurés :

1. **Push sur main** : Chaque push sur la branche `main` déclenchera automatiquement :
   - Build de l'application
   - Tests (si configurés)
   - Déploiement sur Firebase Hosting

2. **Pull Requests** : Chaque PR créera automatiquement :
   - Preview du déploiement
   - URL de test temporaire

3. **Monitoring** : Surveillez les déploiements dans :
   - GitHub Actions (onglet Actions du repository)
   - Firebase Console (onglet Hosting)

## 🚨 Sécurité

- ⚠️ **Ne jamais** commiter la clé de service dans le code
- ⚠️ **Ne jamais** partager la clé de service publiquement
- ✅ La clé est chiffrée dans les secrets GitHub
- ✅ Seules les GitHub Actions peuvent y accéder

## 🔧 Dépannage

### GitHub Actions échoue
- Vérifiez que le secret `FIREBASE_SERVICE_ACCOUNT_KEY` existe
- Vérifiez que le JSON est valide (pas de caractères manquants)
- Consultez les logs dans l'onglet Actions

### Déploiement Firebase échoue  
- Vérifiez que le projet Firebase ID est correct dans `.firebaserc`
- Vérifiez que Hosting est activé dans Firebase Console
- Vérifiez les règles de sécurité Firestore

## 📚 Ressources utiles

- [Documentation Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments)
- [Documentation GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
