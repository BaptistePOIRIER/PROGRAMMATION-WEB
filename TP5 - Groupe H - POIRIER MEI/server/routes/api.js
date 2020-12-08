const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')
const bcrypt = require('bcrypt')
const { Client } = require('pg')

const client = new Client({
 user: 'postgres',
 host: 'localhost',
 password: 'secret',
 database: 'TP5'
})

client.connect()

class Panier {
  constructor () {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
  }
}

/**
 * Dans ce fichier, vous trouverez des exemples de requêtes GET, POST, PUT et DELETE
 * Ces requêtes concernent l'ajout ou la suppression d'articles sur le site
 * Votre objectif est, en apprenant des exemples de ce fichier, de créer l'API pour le panier de l'utilisateur
 *
 * Notre site ne contient pas d'authentification, ce qui n'est pas DU TOUT recommandé.
 * De même, les informations sont réinitialisées à chaque redémarrage du serveur, car nous n'avons pas de système de base de données pour faire persister les données
 */

/**
 * Notre mécanisme de sauvegarde des paniers des utilisateurs sera de simplement leur attribuer un panier grâce à req.session, sans authentification particulière
 */
router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})

/**
 * Cette route permet d'inscrire un utilisateur
 */
router.post('/register', async (req,res) => {
  const email = req.body.email
  const password = req.body.password

  // Récupération des email existants
  const result = await client.query({
    text: 'SELECT email FROM users'
  })

  // Email déjà utilisé dans la base de donnée ?
  const user_email = result.rows.find(a => a.email === email)
  if (user_email) {
    res.status(400).json({ message: 'Email already used'})
    return
  }

  // Hashage du mot de passe
  const hash = await bcrypt.hash(password, 10)

  // Stockage de l'utilisateur
  client.query({
    text: 'INSERT INTO users(email,password) VALUES ($1,$2)',
    values: [email,hash]
  })
  res.status(200).json({ done: 'Successfully registered'})
})

/**
 * Cette route permet à l'utilisateur de se connecter
 */
router.post('/login', async (req,res) => {
  const email = req.body.email
  const password = req.body.password

  // Récupération des email existants
  const result = await client.query({
    text: 'SELECT email,password,id FROM users'
  })

  // Utilisateurs absent de la base de donnée ?
  const user = result.rows.find(a => a.email === email)
  if (!user) {
    res.status(400).json({ message: 'Email cannot be found'})
    return
  }

  // Vérification du mot de passe
  if (await bcrypt.compare(password, user.password)) {
    // Déjà connecté
    if(req.session.userId == user.id) {
      res.status(401).json({ message: 'Already logged'})
    }else {
      // Connexion
      req.session.userId = user.id
      res.status(200).json({ done: 'Successfully logged'})
    }
    return
  }
  // Mauvais mot de passe
  res.status(400).json({ message: 'Wrong password'})
})

/**
 * Cette route permet de renvoyer l'utilisateur connecté
 */
router.get('/me', async (req,res) => {
  // Connecté ?
  if (typeof req.session.userId !== 'number') {
    res.status(401).send({ message: 'No connected users' })
    return
  }

  // Récupération des email existants
  const result = await client.query({
    text: 'SELECT email,id FROM users'
  })

  // Récupération de l'utilisateur connecté
  const user = result.rows.find(a => a.id === req.session.userId)
  res.status(200).json(user)
})


/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get('/panier', (req, res) => {
  res.json(req.session.panier)
})

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post('/panier', (req, res) => {
  const id = parseInt(req.body.id)
  const quantity = parseInt(req.body.quantity)

  // vérification de la validité des données d'entrée
  // L'article est introuvable
  if (id <= 0 || id > articles.length) {
    res.status(400).json({ message: 'Unknown article' })
    return
  }
  // La quantité demandé n'est pas entière strictement positive
  if (quantity <= 0) {
    res.status(400).json({ message: 'Quantity is not a positive integer'})
    return
  }
  // L'article spcéifié est déjà dans le panier
  const article = req.session.panier.articles.find(a => a.id === id)
  if (article) {
    res.status(400).json({ message: 'bad request (already in basket)'})
    return
  }
  const newArticle = {
    id: id,
    quantity: quantity
  }
  req.session.panier.articles.push(newArticle)
  // on envoie l'article ajouté à l'utilisateur
  res.json(newArticle)
})

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post('/panier/pay', (req, res) => {
  if (typeof req.session.userId !== 'number') {
    // Réponse à l'utilisateur
    res.status(401).send({ message: 'Refused! (Not connected)' })
  }else{
    // Suppresion du panier
    //req.session.destroy()
    this.articles = []
    // Réponse à l'utilisateur  
    res.status(200).json({ message: `Merci pour votre achat !`})
  }
})

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put('/panier/:articleId', (req, res) => {
  const articleId = parseInt(req.params.articleId)
  const quantity = parseInt(req.body.quantity)

  // vérification de la validité des données d'entrée
  // Pas de quantité spécifié
  if (isNaN(quantity)) {
    res.status(400).json({ message: 'Quantity is not specified'})
    return
  }
  // La quantité demandé n'est pas entière strictement positive
  if (quantity <= 0) {
    res.status(400).json({ message: 'Quantity is not a positive integer'})
    return
  }
  // Detection et selection de l'article à modifier
  const article = req.session.panier.articles.find(a => a.id === articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' is not in basket' })
    return
  }

  article.quantity = quantity
  res.json(article)
})

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete('/panier/:articleId', (req, res) => {
  const articleId = parseInt(req.params.articleId)

  // Detection et selection de l'article à modifier
  const article = req.session.panier.articles.find(a => a.id === articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' is not in basket' })
    return
  }

  // Suppression
  const index = req.session.panier.articles.findIndex(a => a.id === articleId)
  req.session.panier.articles.splice(index, 1) // remove the article from the array
  res.status(200).json({ message: 'article ' + articleId + ' has been succefully deleted'})
  
})


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', (req, res) => {
  res.json(articles)
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)

  // vérification de la validité des données d'entrée
  if (typeof name !== 'string' || name === '' ||
      typeof description !== 'string' || description === '' ||
      typeof image !== 'string' || image === '' ||
      isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const article = {
    id: articles.length + 1,
    name: name,
    description: description,
    image: image,
    price: price
  }
  articles.push(article)
  // on envoie l'article ajouté à l'utilisateur
  res.json(article)
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
function parseArticle (req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const article = articles.find(a => a.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article
  next()
}

router.route('/article/:articleId')
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, (req, res) => {
    // req.article existe grâce au middleware parseArticle
    res.json(req.article)
  })

  /**
   * Cette route modifie un article.
   * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
   * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
   *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
   */
  .put(parseArticle, (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price
    res.send()
  })

  .delete(parseArticle, (req, res) => {
    const index = articles.findIndex(a => a.id === req.articleId)

    articles.splice(index, 1) // remove the article from the array
    res.send()
  })

module.exports = router
