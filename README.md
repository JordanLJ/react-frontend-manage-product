
# 🖥️ Frontend - Gestion des Produits (React)

## 📖 Description

Ce projet est une interface utilisateur développée avec **React** permettant de gérer des produits via une API Laravel.

L’application permet de :

* Afficher la liste des produits
* Ajouter un produit
* Modifier un produit
* Supprimer un produit
* Associer un produit à une catégorie

---

## ⚙️ Fonctionnalités

* 📄 Affichage des produits dans un tableau
* ➕ Ajout de produit via formulaire
* ✏️ Modification des produits existants
* ❌ Suppression de produit
* 🗂️ Gestion des catégories (select dynamique)
* 🔄 Synchronisation avec API Laravel via Axios
* 🔐 Authentification OAuth2 (Authorization Code + PKCE)

---

## 🛠️ Technologies utilisées

* React (Hooks : `useState`, `useEffect`)
* Axios (requêtes HTTP)
* JavaScript (ES6)
* HTML / CSS simple

---

## 🚀 Installation

1. Cloner le projet :

```bash
git clone https://github.com/ton-repo/frontend-produit.git
cd frontend-produit
```

2. Installer les dépendances :

```bash
npm install
```

3. Lancer l’application :

```bash
npm run dev
```

ou

```bash
npm start
```

---

## 🔗 Configuration API & OAuth

Dans le fichier `.env`, configure :

```bash
VITE_IDENTITY_ISSUER=http://localhost:8080
VITE_TENANT_SLUG=ucb
VITE_CLIENT_ID=TON_CLIENT_ID
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OAUTH_SCOPES=openid profile email offline_access
VITE_API_URL=http://127.0.0.1:8000/api
```

⚠️ Assure-toi que ton backend Laravel est lancé sur ce port.

Le frontend exécute le flow OAuth complet :
1. Redirect vers `GET /v1/{tenant}/oauth/authorize`
2. Retour sur `/auth/callback?code=...&state=...`
3. Échange code/token via `POST /v1/{tenant}/oauth/token`
4. Stockage `access_token` puis appels API avec `Authorization: Bearer ...`

---

## 📌 Fonctionnement

### 🔄 Chargement des données

Au démarrage de l’application :

* Récupération des produits via `GET /api/products`
* Récupération des catégories via `GET /api/categories`

---

### ➕ Ajouter un produit

* Remplir le formulaire
* Cliquer sur **Ajouter**
* Envoi via `POST /api/products`

---

### ✏️ Modifier un produit

* Cliquer sur **Modifier**
* Les champs sont pré-remplis
* Cliquer sur **Modifier**
* Envoi via `PUT /api/products/{id}`

---

### ❌ Supprimer un produit

* Cliquer sur **Supprimer**
* Requête envoyée : `DELETE /api/products/{id}`

---

## 🧠 Logique technique

* Gestion des états avec `useState`
* Chargement initial avec `useEffect`
* Appels API avec Axios
* Réutilisation du formulaire pour création et modification
* Gestion de la relation produit → catégorie

---

## 📊 Structure de l’interface

* Formulaire en haut :

  * Nom
  * Prix
  * Description
  * Quantité
  * Catégorie (select dynamique)
  * SKU

* Tableau en bas :

  * Liste des produits
  * Actions : Modifier / Supprimer

---

## ⚠️ Prérequis

* Node.js installé
* Backend Laravel fonctionnel
* API accessible (CORS activé si nécessaire)

---

## ⚠️ Améliorations possibles

* 🎨 UI moderne (Tailwind / Bootstrap)
* 🔍 Recherche de produits
* 📄 Pagination côté frontend
* 🔐 Authentification utilisateur
* 📦 Gestion du stock avancée
* 🖼️ Upload d’images

---

## 👨‍💻 Auteur

Projet frontend React connecté à une API Laravel de gestion de produits.

---

## 🔗 Backend associé

👉 API Laravel (gestion des produits)

