# PortFlow - Système de Suivi de Navires et Marchandises

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Fonctionnalités](#fonctionnalités)
4. [Technologies Utilisées](#technologies-utilisées)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Structure du Projet](#structure-du-projet)
8. [APIs et Endpoints](#apis-et-endpoints)
9. [Services Externes](#services-externes)
10. [Blockchain Integration (Hedera)](#blockchain-integration-hedera)
11. [Utilisation](#utilisation)
12. [Développement](#développement)

---

## 🎯 Vue d'ensemble

**PortFlow** est une plateforme complète de suivi de navires et de gestion logistique maritime conçue pour les commerçants qui achètent leurs marchandises à l'étranger et les reçoivent par bateau. Le système permet de suivre en temps réel les navires transportant leurs marchandises, de consulter les conditions météorologiques, de gérer les ports, et de recevoir des notifications automatiques sur l'état des expéditions.

### Objectif Principal

Donner aux commerçants la possibilité de :

- **Suivre leurs navires** en temps réel avec position GPS, vitesse, et cap
- **Consulter les informations des ports** par lesquels passent leurs marchandises
- **Recevoir des alertes météorologiques** pour leurs expéditions
- **Communiquer avec les fournisseurs** via un système de messagerie intégré
- **Générer des rapports automatiques** sur les routes, l'avancement, et les conditions météo
- **Consulter des prédictions de risques** enregistrées sur la blockchain Hedera

---

## 🏗️ Architecture du Projet

Le projet utilise une architecture **full-stack** avec séparation frontend/backend :

```
PortFlow/
├── Backend (Django REST Framework)
│   ├── API REST avec authentification JWT
│   ├── Base de données SQLite (développement)
│   └── Services d'intégration (MarineTraffic, OpenWeather)
│
├── Frontend (React + TypeScript)
│   ├── Interface utilisateur moderne (Shadcn UI)
│   ├── Cartes interactives (Leaflet)
│   └── Gestion d'état (React Query)
│
└── Service Blockchain (Node.js)
    └── Serveur Hedera HCS pour enregistrement des prédictions
```

---

## ✨ Fonctionnalités

### Pour les Commerçants (Merchants)

1. **Gestion des Navires**

   - Liste des navires avec marchandises suivis
   - Détails complets : position actuelle, route, durée du voyage
   - Identifiants des conteneurs et routes
   - Visualisation sur carte interactive (Leaflet)

2. **Gestion des Ports**

   - Liste de tous les ports traversés
   - Informations détaillées sur chaque port
   - Historique des passages

3. **Météo**

   - Conditions météorologiques aux positions des navires
   - Météo des ports de départ et d'arrivée
   - Alertes météo automatiques

4. **Messagerie**

   - Chat avec les fournisseurs
   - Notifications de nouveaux messages
   - Historique des conversations

5. **Rapports**

   - Rapports automatiques sur les routes des navires
   - Avancement du voyage
   - Temps d'arrivée estimé (ETA)
   - Conditions météorologiques en route

6. **Analyses**
   - Statistiques sur les expéditions
   - Graphiques de performance
   - Tendances et analyses

### Pour les Administrateurs

Toutes les fonctionnalités des commerçants, plus :

- Gestion des utilisateurs
- Gestion complète des navires et ports
- Dashboard d'analytics global
- Accès à la blockchain Hedera et aux prédictions
- Configuration système

---

## 🛠️ Technologies Utilisées

### Backend

- **Django 5.2.7** - Framework web Python
- **Django REST Framework 3.14.0** - API REST
- **JWT (djangorestframework-simplejwt)** - Authentification
- **SQLite** - Base de données (développement)
- **django-cors-headers** - Gestion CORS
- **drf-yasg** - Documentation Swagger/OpenAPI
- **python-dotenv** - Gestion des variables d'environnement

### Frontend

- **React 18.3.1** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **React Router 6** - Routage
- **TanStack Query** - Gestion d'état serveur
- **Shadcn UI** - Composants UI modernes
- **Leaflet + React-Leaflet** - Cartes interactives
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS

### Blockchain

- **Hedera Hashgraph SDK (@hashgraph/sdk)** - Intégration Hedera
- **Node.js + Express** - Serveur de publication HCS

### Services Externes

- **MarineTraffic API** - Données de suivi des navires (avec fallback demo)
- **OpenWeatherMap API** - Données météorologiques

---

## 📦 Installation

### Prérequis

- Python 3.10+
- Node.js 18+
- pip (gestionnaire de paquets Python)
- npm ou yarn

### Installation Backend

```bash
# Naviguer vers le répertoire racine
cd portflow_back

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver
```

Le serveur Django sera accessible sur `http://localhost:8000`

### Installation Frontend

```bash
# Naviguer vers le dossier frontend
cd portflow-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173` (port par défaut de Vite)

### Installation Service Blockchain (Hedera)

```bash
# Dans le répertoire racine ou hedera_server
cd hedera_server

# Installer les dépendances
npm install

# Lancer le serveur
npm start
# ou
node server.js
```

Le service Hedera sera accessible sur `http://localhost:8787`

---

## ⚙️ Configuration

### Fichier `.env` (Backend)

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Django
SECRET_KEY=votre-secret-key-securisee
DEBUG=True

# MarineTraffic API (optionnel - mode demo disponible)
MARINETRAFFIC_API_KEY=votre-cle-api-marinetraffic

# OpenWeatherMap API (optionnel - mode demo disponible)
OPENWEATHER_API_KEY=votre-cle-api-openweather

# Hedera Configuration
HEDERA_SERVICE_URL=http://127.0.0.1:8787
HEDERA_TOPIC_ID=0.0.xxxxxxxxx
OPERATOR_ID=0.0.xxxxxxxxx
OPERATOR_KEY=votre-cle-privee-hedera
```

### Notes de Configuration

- **MarineTraffic** : Si aucune clé API n'est fournie, le système utilise un mode démo avec des données simulées réalistes
- **OpenWeatherMap** : Si aucune clé n'est fournie, le système utilise également un mode démo
- **Hedera** : Nécessite un compte Hedera Testnet et un Topic ID créé

### Configuration CORS

Le projet est configuré pour autoriser toutes les origines en développement (`CORS_ALLOW_ALL_ORIGINS = True`). Pour la production, modifier dans `portflow_ai/settings.py`.

---

## 📁 Structure du Projet

```
portflow_back/
├── blockchain/              # Application blockchain
│   ├── models.py           # Modèles: Prediction, PointActivity, UserScore
│   ├── views.py            # APIs de prédiction et scoring
│   ├── hedera_client.py    # Client Hedera HCS
│   └── urls.py
│
├── ships/                  # Application navires et ports
│   ├── models.py           # Modèles: Ship, Port
│   ├── views.py            # APIs CRUD et suivi
│   ├── services.py         # Service MarineTraffic
│   └── urls.py
│
├── weather/                # Application météo
│   ├── models.py           # Modèles: WeatherData, WeatherAlert
│   ├── views.py            # APIs météo ports et navires
│   ├── services.py         # Service OpenWeatherMap
│   └── urls.py
│
├── notifications/          # Application notifications
│   ├── models.py           # Modèles: Notification, Message
│   ├── views.py            # APIs notifications et messages
│   ├── services.py         # Service de notifications automatiques
│   └── urls.py
│
├── users/                  # Application utilisateurs
│   ├── models.py           # Modèle: CustomUser
│   ├── views.py            # Authentification et profils
│   └── urls.py
│
├── portflow_ai/            # Configuration principale
│   ├── settings.py         # Configuration Django
│   ├── urls.py             # URLs principales
│   └── wsgi.py
│
├── portflow-frontend/       # Frontend React
│   ├── src/
│   │   ├── pages/          # Pages de l'application
│   │   ├── components/     # Composants React
│   │   ├── services/       # Services API
│   │   ├── contexts/       # Contextes React (Auth, Notifications)
│   │   └── hooks/          # Hooks personnalisés
│   └── package.json
│
├── hedera_server/          # Service blockchain Node.js
│   ├── server.js           # Serveur Express pour Hedera
│   └── package.json
│
└── requirements.txt        # Dépendances Python
```

---

## 🔌 APIs et Endpoints

### Documentation Swagger

Accéder à la documentation interactive :

- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`

### Authentification

```
POST /api/token/              # Connexion (obtenir JWT)
POST /api/token/refresh/       # Rafraîchir le token
POST /api/users/register/      # Inscription
GET  /api/users/profile/      # Profil utilisateur
```

### Navires (Ships)

```
GET    /api/ships/                    # Liste des navires
POST   /api/ships/                    # Créer un navire
GET    /api/ships/{id}/               # Détails d'un navire
PUT    /api/ships/{id}/               # Modifier un navire
DELETE /api/ships/{id}/               # Supprimer un navire
POST   /api/ships/search/              # Rechercher un navire (IMO)
POST   /api/ships/{id}/track/          # Commencer à suivre
POST   /api/ships/{id}/untrack/        # Arrêter de suivre
GET    /api/ships/tracked/             # Navires suivis par l'utilisateur
GET    /api/ships/{id}/tracking/       # Détails de suivi complet
GET    /api/ships/{id}/position/      # Position actuelle
POST   /api/ships/update-positions/    # Mettre à jour positions (admin)
GET    /api/ships/stats/               # Statistiques
```

### Ports

```
GET    /api/ships/ports/              # Liste des ports
POST   /api/ships/ports/               # Créer un port
GET    /api/ships/ports/{id}/         # Détails d'un port
PUT    /api/ships/ports/{id}/         # Modifier un port
DELETE /api/ships/ports/{id}/         # Supprimer un port
GET    /api/ships/ports/stats/        # Statistiques des ports
```

### Météo

```
GET  /api/weather/port/{port_id}/           # Météo d'un port
GET  /api/weather/ship/{ship_id}/           # Météo à la position d'un navire
GET  /api/weather/ship/{ship_id}/route/      # Analyse météo de la route
GET  /api/weather/ship/{ship_id}/alerts/    # Alertes météo pour un navire
GET  /api/weather/alerts/                   # Toutes les alertes actives
GET  /api/weather/all-current/              # Météo actuelle de tous les ports
GET  /api/weather/stats/                    # Statistiques météo
POST /api/weather/update-all/               # Mettre à jour toutes les météos (admin)
```

### Notifications

```
GET  /api/notifications/                    # Liste des notifications
POST /api/notifications/{id}/read/          # Marquer comme lu
GET  /api/notifications/unread-count/       # Nombre de non lues
```

### Messages

```
GET  /api/notifications/messages/            # Liste des messages reçus
POST /api/notifications/messages/            # Envoyer un message
```

### Blockchain / Prédictions

```
POST /api/blockchain/predict/               # Créer une prédiction (publie sur Hedera)
GET  /api/blockchain/predictions/            # Liste des prédictions
GET  /api/blockchain/transactions/           # Transactions Hedera (dev)
```

### Scoring / Points

```
GET  /api/blockchain/activities/             # Historique des activités
GET  /api/blockchain/score/                 # Score et niveau utilisateur
POST /api/blockchain/add-points/            # Ajouter des points
```

---

## 🌐 Services Externes

### MarineTraffic

Service de suivi maritime en temps réel. Le système :

- Récupère les positions GPS des navires
- Obtient la vitesse, le cap, et le statut
- Récupère les destinations et ETA
- **Mode démo** : Si aucune clé API n'est fournie, génère des données réalistes basées sur des ports africains

### OpenWeatherMap

Service météorologique. Le système :

- Récupère les conditions actuelles pour les ports
- Analyse la météo à la position des navires
- Génère des alertes automatiques (vents forts, brouillard, etc.)
- **Mode démo** : Données simulées si aucune clé n'est fournie

---

## ⛓️ Blockchain Integration (Hedera)

Le projet intègre **Hedera Hashgraph** pour l'enregistrement immuable des prédictions de risques maritimes.

### Architecture

```
Django Backend → hedera_client.py → Node.js Service → Hedera HCS
```

1. **Backend Django** crée une prédiction avec un score de risque
2. **hedera_client.py** prépare le message et le hash SHA-256
3. **Service Node.js** (port 8787) publie sur Hedera Consensus Service (HCS)
4. **Transaction ID** et statut sont retournés et stockés

### Configuration Hedera

1. Créer un compte sur [Hedera Portal](https://portal.hedera.com/)
2. Créer un Topic ID sur le Testnet
3. Obtenir OPERATOR_ID et OPERATOR_KEY
4. Configurer dans `.env`

### Endpoints Blockchain

- **Créer prédiction** : `POST /api/blockchain/predict/`

  ```json
  {
    "ship_name": "Ever Given",
    "lat": 25.5,
    "lon": 55.3
  }
  ```

- **Liste prédictions** : `GET /api/blockchain/predictions/?limit=20`

### Système de Points

Les utilisateurs gagnent des points pour leurs activités :

- Création de prédiction
- Connexion quotidienne
- Suivi de navires
- etc.

Niveaux automatiques :

- **Débutant** : < 100 points
- **Moyen** : 100-499 points
- **Avancé** : 500-999 points
- **Expert** : 1000+ points

---

## 🚀 Utilisation

### Démarrage Complet

```bash
# Terminal 1 - Backend Django
cd portflow_back
python manage.py runserver

# Terminal 2 - Frontend React
cd portflow-frontend
npm run dev

# Terminal 3 - Service Hedera (optionnel)
cd hedera_server
npm start
```

### Flux d'Utilisation Typique

1. **Inscription/Connexion** : Créer un compte ou se connecter
2. **Rechercher un navire** : Utiliser le numéro IMO pour trouver un navire
3. **Suivre un navire** : Ajouter le navire à sa liste de suivi
4. **Visualiser sur carte** : Voir la position actuelle et la route
5. **Consulter la météo** : Vérifier les conditions à la position et aux ports
6. **Recevoir notifications** : Alertes automatiques sur retards, météo, etc.
7. **Communiquer** : Envoyer des messages aux fournisseurs
8. **Générer rapports** : Consulter les rapports automatiques

### Rôles Utilisateurs

- **Merchant (Commerçant)** : Accès aux fonctionnalités de suivi et gestion
- **Admin (Administrateur)** : Accès complet + gestion système

---

## 👨‍💻 Développement

### Commandes Utiles

```bash
# Migrations Django
python manage.py makemigrations
python manage.py migrate

# Créer des données de test
python manage.py shell
# Puis utiliser les commandes de génération de données

# Tests (à implémenter)
python manage.py test

# Linter
# Backend: flake8, black (à configurer)
# Frontend: npm run lint
```

### Génération de Données de Test

Le projet inclut des commandes de management pour générer des données de test :

- Navires
- Ports
- Utilisateurs
- Données météo

### Structure des Modèles Principaux

#### CustomUser

- `user_type`: admin ou merchant
- `points`: points de gamification
- `phone_number`, `company_name`

#### Ship

- `name`, `imo_number`, `type`
- `current_latitude`, `current_longitude`
- `current_speed`, `current_heading`, `status`
- `destination_port`, `expected_arrival`
- `tracked_by`: ManyToMany avec User

#### Port

- `name`, `country`, `city`
- `latitude`, `longitude`, `code`

#### Notification

- `user`, `title`, `message`
- `notification_type`: delay, weather, position, arrival, etc.
- `severity`: low, medium, high, critical
- `related_ship`, `is_read`

#### Prediction (Blockchain)

- `ship_name`, `lat`, `lon`
- `risk_score`
- `hcs_status`, `hcs_tx_id` (Hedera)
- `message_hash` (SHA-256)

---

## 📝 Notes Importantes

1. **Mode Démo** : Le système fonctionne en mode démo si les clés API ne sont pas configurées, avec des données réalistes simulées
2. **Base de données** : SQLite en développement, à migrer vers PostgreSQL en production
3. **Sécurité** : En production, modifier `SECRET_KEY`, `DEBUG=False`, et configurer correctement CORS
4. **Hedera** : Actuellement configuré pour le Testnet, adapter pour Mainnet en production

---

## 🤝 Contribution

Ce projet a été développé dans le cadre d'un hackathon Hedera. Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---



## 📚 Présentation et certificats


La présentation et les certificats ont été déposés dans le dépôt. Vous les trouverez aux emplacements suivants :

- Présentation : [docs/Presentation_Portflow_ai.pptx](docs/Presentation_Portflow_ai.pptx)

- Certificats (dossier `certificates/`) :
   - [certificates/Fatimetou_Mahand_Certificat.pdf](certificates/Fatimetou_Mahand_Certificat.pdf)
   - [certificates/Fatimetou_Souvi_Certificate.pdf](certificates/Fatimetou_Souvi_Certificate.pdf)
   - [certificates/Mohameden_Debagh_Certificat.pdf](certificates/Mohameden_Debagh_Certificat.pdf)
   - [certificates/Tutu_Radhy_Certificat.pdf](certificates/Tutu_Radhy_Certificat.pdf)
   - [certificates/Wethigha_AbdelAziz_certificate.pdf](certificates/Wethigha_AbdelAziz_certificate.pdf)
   - [certificates/zeid-imigine.pdf](certificates/zeid-imigine.pdf)



=======

**PortFlow** - Suivez vos marchandises en toute transparence 🌊🚢
